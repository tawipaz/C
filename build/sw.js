// ==============================================
// แนวทางปรับปรุงระบบสำหรับรองรับผู้ใช้จำนวนมาก
// ==============================================

// 1. เพิ่ม Service Worker สำหรับ Caching
// File: public/sw.js
const CACHE_NAME = 'personnel-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('googleapis.com')) {
    // Cache Google Sheets API responses for 5 minutes
    event.respondWith(
      caches.open('api-cache').then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            const age = Date.now() - new Date(cachedResponse.headers.get('date')).getTime();
            if (age < 5 * 60 * 1000) { // 5 minutes
              return cachedResponse;
            }
          }
          
          return fetch(event.request).then((response) => {
            cache.put(event.request, response.clone());
            return response;
          });
        });
      })
    );
  }
});

// 2. เพิ่ม IndexedDB สำหรับ Local Storage
// File: src/utils/localDB.js
import { openDB } from 'idb';

class LocalPersonnelDB {
  constructor() {
    this.dbPromise = this.initDB();
  }

  async initDB() {
    return openDB('PersonnelDB', 1, {
      upgrade(db) {
        const store = db.createObjectStore('personnel', {
          keyPath: 'phone'
        });
        store.createIndex('name', ['firstname', 'lastname']);
        store.createIndex('position', 'position');
        store.createIndex('lastUpdated', 'lastUpdated');
      }
    });
  }

  async savePersonnel(data) {
    const db = await this.dbPromise;
    const tx = db.transaction('personnel', 'readwrite');
    
    for (const person of data) {
      await tx.store.put({
        ...person,
        lastUpdated: Date.now()
      });
    }
    
    await tx.done;
  }

  async getPersonnel() {
    const db = await this.dbPromise;
    return db.getAll('personnel');
  }

  async isDataStale() {
    const db = await this.dbPromise;
    const latest = await db.transaction('personnel')
      .store.index('lastUpdated')
      .openCursor(null, 'prev');
    
    if (!latest?.value) return true;
    
    const age = Date.now() - latest.value.lastUpdated;
    return age > 10 * 60 * 1000; // 10 minutes
  }
}

export const localDB = new LocalPersonnelDB();

// 3. ปรับปรุง PersonnelPage ด้วย Advanced Caching
// File: src/pages/PersonnelPageAdvanced.js
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { localDB } from '../utils/localDB';

export default function PersonnelPageAdvanced({ user }) {
  const [loading, setLoading] = useState(true);
  const [personnelData, setPersonnelData] = useState([]);
  const [lastFetchTime, setLastFetchTime] = useState(null);

  // แคช Google Sheets API response
  const fetchWithCache = useCallback(async () => {
    const cacheKey = 'personnel-data';
    const cachedData = localStorage.getItem(cacheKey);
    const cacheTime = localStorage.getItem(cacheKey + '-time');
    
    // ใช้ข้อมูลแคชถ้าอายุไม่เกิน 5 นาที
    if (cachedData && cacheTime) {
      const age = Date.now() - parseInt(cacheTime);
      if (age < 5 * 60 * 1000) {
        console.log('📦 Using cached data');
        return JSON.parse(cachedData);
      }
    }

    // ดึงข้อมูลใหม่จาก API
    console.log('🌐 Fetching fresh data from API');
    const response = await fetch(`${CONFIG.GOOGLE_SHEET_API_URL}?action=getAllPersonnel`);
    const data = await response.json();
    
    // บันทึกลงแคช
    localStorage.setItem(cacheKey, JSON.stringify(data));
    localStorage.setItem(cacheKey + '-time', Date.now().toString());
    
    return data;
  }, []);

  // ใช้ IndexedDB สำหรับ offline support
  const loadPersonnelData = useCallback(async () => {
    try {
      setLoading(true);
      
      // ลองใช้ข้อมูลจาก IndexedDB ก่อน
      const isStale = await localDB.isDataStale();
      if (!isStale) {
        console.log('💾 Loading from IndexedDB');
        const localData = await localDB.getPersonnel();
        if (localData.length > 0) {
          setPersonnelData(localData);
          setLoading(false);
          return; // ใช้ข้อมูล local และจบ
        }
      }

      // ถ้าข้อมูล local ไม่มีหรือเก่า ให้ดึงจาก API
      const freshData = await fetchWithCache();
      if (Array.isArray(freshData)) {
        setPersonnelData(freshData);
        await localDB.savePersonnel(freshData);
        setLastFetchTime(Date.now());
      }
    } catch (error) {
      console.error('Error loading personnel data:', error);
      // ถ้า API fail ให้ใช้ข้อมูล local (offline mode)
      const localData = await localDB.getPersonnel();
      if (localData.length > 0) {
        console.log('🔌 Using offline data');
        setPersonnelData(localData);
      }
    } finally {
      setLoading(false);
    }
  }, [fetchWithCache]);

  useEffect(() => {
    loadPersonnelData();
  }, [loadPersonnelData]);

  // Background sync ทุก 10 นาที
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        console.log('🔄 Background sync');
        loadPersonnelData();
      }
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(interval);
  }, [loading, loadPersonnelData]);

  // ... rest of component
}

// 4. เพิ่ม Web Worker สำหรับ Heavy Computation
// File: public/worker.js
self.onmessage = function(e) {
  const { type, data } = e.data;
  
  switch (type) {
    case 'FILTER_PERSONNEL':
      const { personnel, filters } = data;
      const filtered = personnel.filter(person => {
        // Heavy filtering logic here
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          const searchableText = [
            person.firstname, 
            person.lastname, 
            person.position, 
            person.affiliation,
            person.phone
          ].filter(Boolean).join(' ').toLowerCase();
          
          if (!searchableText.includes(searchTerm)) return false;
        }
        
        if (filters.position && person.position !== filters.position) return false;
        if (filters.affiliation && person.affiliation !== filters.affiliation) return false;
        
        return true;
      });
      
      self.postMessage({ type: 'FILTER_COMPLETE', data: filtered });
      break;
      
    case 'CALCULATE_STATS':
      const stats = calculateStatistics(data);
      self.postMessage({ type: 'STATS_COMPLETE', data: stats });
      break;
  }
};

function calculateStatistics(personnel) {
  const stats = {
    total: personnel.length,
    connected: personnel.filter(p => p.lineUserId).length,
    byPosition: {},
    byAffiliation: {},
    byGeneration: {}
  };
  
  personnel.forEach(person => {
    const position = person.position || 'ไม่ระบุ';
    stats.byPosition[position] = (stats.byPosition[position] || 0) + 1;
    
    const affiliation = person.affiliation || 'ไม่ระบุ';
    stats.byAffiliation[affiliation] = (stats.byAffiliation[affiliation] || 0) + 1;
    
    const generation = person.generation || 'ไม่ระบุ';
    stats.byGeneration[generation] = (stats.byGeneration[generation] || 0) + 1;
  });
  
  return stats;
}

// 5. Hook สำหรับใช้ Web Worker
// File: src/hooks/useWebWorker.js
import { useEffect, useRef, useState } from 'react';

export function useWebWorker(workerScript) {
  const workerRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    workerRef.current = new Worker(workerScript);
    workerRef.current.onmessage = (e) => {
      // Handle messages from worker
    };
    setIsReady(true);

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, [workerScript]);

  const postMessage = (message) => {
    if (workerRef.current && isReady) {
      workerRef.current.postMessage(message);
    }
  };

  return { postMessage, isReady };
}

// 6. ระบบ Queue สำหรับ API Calls
// File: src/utils/apiQueue.js
class APIQueue {
  constructor(maxConcurrent = 3, delayBetweenRequests = 100) {
    this.queue = [];
    this.running = [];
    this.maxConcurrent = maxConcurrent;
    this.delay = delayBetweenRequests;
  }

  async add(apiCall) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        apiCall,
        resolve,
        reject
      });
      this.process();
    });
  }

  async process() {
    if (this.running.length >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    const { apiCall, resolve, reject } = this.queue.shift();
    const promise = this.executeWithDelay(apiCall);
    
    this.running.push(promise);

    try {
      const result = await promise;
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running = this.running.filter(p => p !== promise);
      this.process(); // Process next item
    }
  }

  async executeWithDelay(apiCall) {
    if (this.delay > 0) {
      await new Promise(resolve => setTimeout(resolve, this.delay));
    }
    return apiCall();
  }
}

export const apiQueue = new APIQueue(3, 200); // Max 3 concurrent, 200ms delay

// การใช้งาน:
// const data = await apiQueue.add(() => fetch(url).then(r => r.json()));

// 7. Configuration สำหรับสภาพแวดล้อมที่ต่างกัน
// File: src/config/performance.js
export const PERFORMANCE_CONFIG = {
  development: {
    itemsPerPage: 10,
    cacheTimeout: 1 * 60 * 1000, // 1 minute
    enableVirtualization: false,
    maxConcurrentRequests: 1
  },
  
  production: {
    itemsPerPage: 50,
    cacheTimeout: 10 * 60 * 1000, // 10 minutes
    enableVirtualization: true,
    maxConcurrentRequests: 3
  },
  
  enterprise: {
    itemsPerPage: 100,
    cacheTimeout: 30 * 60 * 1000, // 30 minutes
    enableVirtualization: true,
    maxConcurrentRequests: 5,
    enableWebWorkers: true,
    enableOfflineMode: true
  }
};

const env = process.env.NODE_ENV || 'development';
export const config = PERFORMANCE_CONFIG[env] || PERFORMANCE_CONFIG.development;