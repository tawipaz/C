import React, { useEffect, useState } from "react";
import { 
  Clock, 
  Users, 
  Shield, 
  RefreshCw,
  MapPin,
  Phone,
  AlertCircle,
  Plus,
  FileText,
  Megaphone,
  TrendingUp,
  Eye,
  MessageCircle,
  Calendar,
  Edit3,
  Trash2,
  Send,
  CheckCircle2,
  Star,
  Bell
} from "lucide-react";

// Componentสำหรับ Modal สร้างข่าว/รายงาน
const NewsModal = ({ isOpen, onClose, onSave, editingNews }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'ประกาศ',
    priority: 'ปกติ'
  });

  useEffect(() => {
    if (editingNews) {
      setFormData({
        title: editingNews.title,
        content: editingNews.content,
        category: editingNews.category,
        priority: editingNews.priority
      });
    } else {
      setFormData({
        title: '',
        content: '',
        category: 'ประกาศ',
        priority: 'ปกติ'
      });
    }
  }, [editingNews, isOpen]);

  const handleSave = () => {
    const newsData = {
      ...formData,
      id: editingNews?.id || Date.now(),
      author: "ผู้ใช้ปัจจุบัน",
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      views: editingNews?.views || 0,
      status: 'draft'
    };
    onSave(newsData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          {editingNews ? 'แก้ไขข่าว/ประกาศ' : 'สร้างข่าว/ประกาศใหม่'}
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">หัวข้อ</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="หัวข้อข่าว/ประกาศ"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">หมวดหมู่</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ประกาศ">ประกาศ</option>
                <option value="รายงาน">รายงาน</option>
                <option value="อบรม">อบรม</option>
                <option value="ข่าว">ข่าว</option>
                <option value="แจ้งเตือน">แจ้งเตือน</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">ความสำคัญ</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ปกติ">ปกติ</option>
                <option value="สูง">สูง</option>
                <option value="ด่วน">ด่วน</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">เนื้อหา</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              rows={8}
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="เนื้อหาข่าว/ประกาศ..."
            />
          </div>
        </div>
        
        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            บันทึก
          </button>
        </div>
      </div>
    </div>
  );
};

// Component สำหรับแสดงการ์ดข่าว
const NewsCard = ({ news, onEdit, onDelete, onPublish }) => {
  const priorityColors = {
    'ปกติ': 'bg-blue-100 text-blue-700',
    'สูง': 'bg-orange-100 text-orange-700',
    'ด่วน': 'bg-red-100 text-red-700'
  };

  const categoryColors = {
    'ประกาศ': 'bg-purple-100 text-purple-700',
    'รายงาน': 'bg-green-100 text-green-700',
    'อบรม': 'bg-yellow-100 text-yellow-700',
    'ข่าว': 'bg-blue-100 text-blue-700',
    'แจ้งเตือน': 'bg-red-100 text-red-700'
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs rounded-full ${categoryColors[news.category]}`}>
            {news.category}
          </span>
          <span className={`px-2 py-1 text-xs rounded-full ${priorityColors[news.priority]}`}>
            {news.priority}
          </span>
          {news.status === 'published' && (
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          )}
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onEdit(news)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(news.id)}
            className="p-1 text-slate-400 hover:text-red-600 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">{news.title}</h3>
      <p className="text-sm text-slate-600 mb-4 line-clamp-3">{news.content}</p>

      <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
        <span>โดย {news.author}</span>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Eye className="w-3 h-3" />
            <span>{news.views}</span>
          </div>
          <span>{news.date} {news.time}</span>
        </div>
      </div>

      {news.status === 'draft' && (
        <button
          onClick={() => onPublish(news.id)}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Send className="w-4 h-4" />
          <span>เผยแพร่</span>
        </button>
      )}
    </div>
  );
};

export default function DashboardPage({ user }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [now, setNow] = useState(new Date());
  const [news, setNews] = useState([]); // <-- Removed mockNews
  const [reports, setReports] = useState([]); // <-- Removed mockReports
  
  // Modal states
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [editingNews, setEditingNews] = useState(null);

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // จำลองการโหลดข้อมูล
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    // In a real app, you would fetch data here.
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleCreateNews = () => {
    setEditingNews(null);
    setShowNewsModal(true);
  };

  const handleEditNews = (newsItem) => {
    setEditingNews(newsItem);
    setShowNewsModal(true);
  };

  const handleSaveNews = (newsData) => {
    if (editingNews) {
      setNews(prev => prev.map(n => n.id === editingNews.id ? newsData : n));
    } else {
      setNews(prev => [newsData, ...prev]);
    }
    setShowNewsModal(false);
    setEditingNews(null);
  };

  const handleDeleteNews = (newsId) => {
    if (window.confirm('ต้องการลบข่าว/ประกาศนี้หรือไม่?')) {
      setNews(prev => prev.filter(n => n.id !== newsId));
    }
  };

  const handlePublishNews = (newsId) => {
    setNews(prev => prev.map(n => 
      n.id === newsId ? { ...n, status: 'published' } : n
    ));
  };

  // Statistics
  const stats = {
    totalNews: news.length,
    publishedNews: news.filter(n => n.status === 'published').length,
    draftNews: news.filter(n => n.status === 'draft').length,
    totalViews: news.reduce((sum, n) => sum + n.views, 0)
  };

  const timeString = now.toLocaleTimeString("th-TH", { 
    hour: "2-digit", 
    minute: "2-digit", 
    second: "2-digit" 
  });
  
  const dateString = now.toLocaleDateString("th-TH", {
    weekday: "long",
    year: "numeric", 
    month: "long", 
    day: "numeric"
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent"></div>
            </div>
            <p className="text-slate-600 font-medium">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-3xl font-bold text-slate-900 font-mono tracking-tight">
              {timeString}
            </div>
            <div className="text-sm text-slate-600">{dateString}</div>
          </div>
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 text-slate-600 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Officer Status Card */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <div className="font-bold text-lg">
                  {user?.prefix} {user?.firstname} {user?.lastname}
                </div>
                <div className="text-white/90">{user?.position}</div>
                <div className="text-white/80 text-sm flex items-center mt-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  {user?.affiliation} • {user?.department}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-green-400/20 px-4 py-2 rounded-full text-sm font-medium mb-2">
                ออนไลน์
              </div>
              <div className="text-white/80 text-xs">
                รุ่น {user?.generation}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <div className="text-3xl font-bold text-slate-900">{stats.totalNews}</div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="text-sm text-slate-600">ข่าว/ประกาศทั้งหมด</div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <div className="text-3xl font-bold text-slate-900">{stats.publishedNews}</div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Megaphone className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="text-sm text-slate-600">เผยแพร่แล้ว</div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <div className="text-3xl font-bold text-slate-900">{stats.draftNews}</div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Edit3 className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="text-sm text-slate-600">ร่างที่ยังไม่เผยแพร่</div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <div className="text-3xl font-bold text-slate-900">{stats.totalViews}</div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Eye className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="text-sm text-slate-600">ยอดเข้าชมรวม</div>
        </div>
      </div>

      {/* News Management Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">จัดการข่าวศาล</h2>
          <button
            onClick={handleCreateNews}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>สร้างข่าว/ประกาศ</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {news.map(newsItem => (
            <NewsCard
              key={newsItem.id}
              news={newsItem}
              onEdit={handleEditNews}
              onDelete={handleDeleteNews}
              onPublish={handlePublishNews}
            />
          ))}
        </div>

        {news.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">ยังไม่มีข่าว/ประกาศ</h3>
            <p className="text-slate-600 mb-4">เริ่มต้นสร้างข่าวหรือประกาศสำหรับศาล</p>
            <button
              onClick={handleCreateNews}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>สร้างข่าวแรก</span>
            </button>
          </div>
        )}
      </div>

      {/* Recent Reports Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">รายงานล่าสุด</h3>
          <span className="text-sm text-slate-500">แสดง {reports.length} รายการ</span>
        </div>
        
        <div className="space-y-3">
          {reports.map(report => (
            <div key={report.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <div className="font-medium text-slate-900">{report.title}</div>
                  <div className="text-sm text-slate-600">โดย {report.submitted_by} • {report.date}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  report.status === 'approved' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {report.status === 'approved' ? 'อนุมัติแล้ว' : 'รออนุมัติ'}
                </span>
                <button className="p-1 text-slate-400 hover:text-slate-600">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-md transition-shadow text-left">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-2">สร้างรายงาน</h3>
          <p className="text-sm text-slate-600">สร้างรายงานผลการปฏิบัติงาน</p>
        </button>

        <button className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-md transition-shadow text-left">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
            <Calendar className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-2">ตารางเวร</h3>
          <p className="text-sm text-slate-600">จัดการตารางเวรปฏิบัติการ</p>
        </button>

        <button className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-md transition-shadow text-left">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-2">จัดการบุคลากร</h3>
          <p className="text-sm text-slate-600">ดูข้อมูลและจัดการบุคลากร</p>
        </button>

        <button className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-md transition-shadow text-left">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
            <MessageCircle className="w-6 h-6 text-orange-600" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-2">แชทหน่วย</h3>
          <p className="text-sm text-slate-600">สื่อสารภายในหน่วยงาน</p>
        </button>
      </div>

      {/* News Modal */}
      <NewsModal
        isOpen={showNewsModal}
        onClose={() => {
          setShowNewsModal(false);
          setEditingNews(null);
        }}
        onSave={handleSaveNews}
        editingNews={editingNews}
      />
    </div>
  );
}