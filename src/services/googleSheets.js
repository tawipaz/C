// src/services/googleSheets.js
const API_URL = process.env.REACT_APP_APPS_SCRIPT_URL || "/"; // ถ้า Dev ใช้ proxy

// ค้นหาสมาชิกตามเบอร์
export async function findPersonByPhone(phone) {
  const res = await fetch(`${API_URL}?action=findPersonByPhone&phone=${encodeURIComponent(phone)}`);
  if (!res.ok) throw new Error("Network error");
  return res.json();
}

// ค้นหาสมาชิกตามชื่อ
export async function findPersonByName(name) {
  const res = await fetch(`${API_URL}?action=findPersonByName&name=${encodeURIComponent(name)}`);
  if (!res.ok) throw new Error("Network error");
  return res.json();
}

// ดึงสมาชิกทั้งหมด
export async function getAllPersonnel() {
  const res = await fetch(`${API_URL}?action=getAllPersonnel`);
  if (!res.ok) throw new Error("Network error");
  return res.json();
}

// เรียก LINE Profile หลัง redirect กลับมา
export async function getLineProfile(code, redirectUri) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "getLineProfile",
      payload: { code, redirect_uri: redirectUri }
    }),
  });
  if (!res.ok) throw new Error("Network error");
  return res.json();
}

// อัปเดต lineUserId ในชีท
export async function updateUser(phone, lineUserId, role = "member") {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "updateUser",
      payload: { phone, lineUserId, role }
    }),
  });
  if (!res.ok) throw new Error("Network error");
  return res.json();
}
