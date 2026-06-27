import React, { useState, useEffect, useMemo, useRef } from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import QRious from 'qrious';

// --- 내장 SVG 아이콘 컴포넌트 ---
const IconBase = ({ size = 24, className = "", fill = "none", children, ...rest }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...rest}>
    {children}
  </svg>
);

const CheckCircle = (p) => <IconBase {...p}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></IconBase>;
const Clock = (p) => <IconBase {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></IconBase>;
const BookOpen = (p) => <IconBase {...p}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></IconBase>;
const Microscope = (p) => <IconBase {...p}><path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h2"/><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"/><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/></IconBase>;
const Users = (p) => <IconBase {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></IconBase>;
const Star = (p) => <IconBase {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></IconBase>;
const Award = (p) => <IconBase {...p}><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></IconBase>;
const LogOut = (p) => <IconBase {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></IconBase>;
const Check = (p) => <IconBase {...p}><polyline points="20 6 9 17 4 12"/></IconBase>;
const X = (p) => <IconBase {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></IconBase>;
const AlertCircle = (p) => <IconBase {...p}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></IconBase>;
const Edit2 = (p) => <IconBase {...p}><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></IconBase>;
const Trash2 = (p) => <IconBase {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></IconBase>;
const Download = (p) => <IconBase {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></IconBase>;
const Lock = (p) => <IconBase {...p}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></IconBase>;
const UserPlus = (p) => <IconBase {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></IconBase>;
const ShieldAlert = (p) => <IconBase {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></IconBase>;
const UserCheck = (p) => <IconBase {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></IconBase>;
const QrCodeIcon = (p) => <IconBase {...p}><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/></IconBase>;

// =========================================================
// Firebase 설정
// =========================================================
const firebaseConfig = {
  apiKey: "AIzaSyCvslatUqinoFPE03kOJzp4ykBeHZuMuUU",
  authDomain: "myclass-certification.firebaseapp.com",
  projectId: "myclass-certification",
  storageBucket: "myclass-certification.firebasestorage.app",
  messagingSenderId: "999701003048",
  appId: "1:999701003048:web:c2fa44a0a6ac3e6fd42e1d"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

const appId = 'my-school-class';
const getSubmissionsRef = () => db.collection('artifacts').doc(appId).collection('public').doc('data').collection('class_submissions');
const getUsersRef = () => db.collection('artifacts').doc(appId).collection('public').doc('data').collection('class_users');
const getSubmissionDoc = (id) => getSubmissionsRef().doc(id);
const getUserDoc = (name) => getUsersRef().doc(name);

// =========================================================
// 월 계산 로직
// =========================================================
const calculateRequiredMonths = (startMonth = 3) => {
  const today = new Date();
  const year = today.getFullYear();
  let currentMonth = today.getMonth() + 1;
  if (currentMonth > 11) currentMonth = 11;

  const months = [];
  for (let i = startMonth; i <= currentMonth; i++) {
    const monthString = i < 10 ? `0${i}` : `${i}`;
    months.push(`${year}-${monthString}`);
  }
  return months;
};

const BASE_REQUIRED_MONTHS = calculateRequiredMonths(3);
const START_MONTH_EXCEPTIONS = { "이소은": 4 };

const getStudentReqMonths = (studentName) => {
  let startM = 3;
  for (const [name, m] of Object.entries(START_MONTH_EXCEPTIONS)) {
    if (studentName.includes(name)) { startM = m; break; }
  }
  return calculateRequiredMonths(startM);
};

const CATEGORIES = [
  { id: 1, title: '자기주도학습시간 (월 7시간 이상)', icon: Clock },
  { id: 2, title: '진로산책 프로그램', icon: Users },
  { id: 3, title: '독서를 품다', icon: BookOpen },
  { id: 4, title: '미래학자양성과정 / 심화연구', icon: Microscope },
  { id: 5, title: '과학/공학 교내 또는 프로젝트 봉사', icon: Star },
  { id: 6, title: '융합 STEAM 데이 전공 강좌', icon: Award },
  { id: 7, title: '과학/공학 관련 동아리 활동', icon: Users },
];

function App() {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  
  const [loginTab, setLoginTab] = useState('student');
  const [loginStudentNum, setLoginStudentNum] = useState(''); 
  const [loginName, setLoginName] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [view, setView] = useState('dashboard');
  const [teacherTab, setTeacherTab] = useState('pending');
  const [filterCategory, setFilterCategory] = useState('all');
  const [listSortOrder, setListSortOrder] = useState('timeDesc'); 
  const [allViewMode, setAllViewMode] = useState('matrix'); 
  
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  
  const [showQrModal, setShowQrModal] = useState(false); 
  const [qrImageUrl, setQrImageUrl] = useState(''); 
  
  const [uploadText, setUploadText] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadTeacherText, setUploadTeacherText] = useState(''); 
  const [uploadTeacherMessage, setUploadTeacherMessage] = useState(''); 
  const [coTeacherInput, setCoTeacherInput] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [formStudentName, setFormStudentName] = useState(''); 
  const [formCategory, setFormCategory] = useState(1);
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10)); 
  const [formHours, setFormHours] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [submitMessage, setSubmitMessage] = useState({ text: '', type: '' });

  const formatName = (fullName, isTable = true) => {
    if (!fullName) return '';
    const match = String(fullName).trim().match(/^(\d+)\s*(.+)$/);
    if (match && match[1] && match[2]) {
      if (isTable) {
        return (
          <div className="inline-grid grid-cols-2 gap-2 w-36 items-center">
            <span className="text-center text-slate-500 font-normal tracking-widest">{match[1]}</span>
            <span className="text-center text-slate-800 font-bold">{match[2]}</span>
          </div>
        );
      } else {
        return (
          <span className="inline-flex items-center gap-3">
            <span className="text-slate-500 font-normal tracking-widest">{match[1]}</span>
            <span className="text-slate-800 font-bold">{match[2]}</span>
          </span>
        );
      }
    }
    return <span className="font-bold text-slate-800">{fullName}</span>;
  };

  useEffect(() => {
    const initAuth = async () => {
      try { await auth.signInAnonymously(); } catch (error) { console.error(error); }
    };
    initAuth();
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setFirebaseUser(user);
      setIsLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!firebaseUser) return;
    const unsubscribeSub = getSubmissionsRef().onSnapshot((snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => b.timestamp - a.timestamp);
      setSubmissions(data);
    }, console.error);

    const unsubscribeUsers = getUsersRef().onSnapshot((snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, name: doc.id, ...doc.data() }));
      setAllUsers(data);
    }, console.error);

    return () => { unsubscribeSub(); unsubscribeUsers(); };
  }, [firebaseUser]);

  useEffect(() => {
    if (showQrModal) {
      setTimeout(() => {
        try {
          const qr = new QRious({ value: window.location.href, size: 250, level: 'H' });
          setQrImageUrl(qr.toDataURL('image/png'));
        } catch(e) { console.error(e); }
      }, 50);
    } else {
      setQrImageUrl('');
    }
  }, [showQrModal]);

  const myMainTeacherName = useMemo(() => {
    if (!currentUser) return null;
    if (currentUser.role === 'student') return currentUser.teacherName;
    if (currentUser.role === 'admin') return null;
    const parentTeacher = allUsers.find(u => u.role === 'teacher' && Array.isArray(u.coTeachers) && u.coTeachers.includes(currentUser.name));
    if (parentTeacher) return parentTeacher.name;
    return currentUser.name;
  }, [currentUser, allUsers]);

  const myCoTeachers = useMemo(() => {
    if (!currentUser || currentUser.role !== 'teacher') return [];
    const me = allUsers.find(u => u.name === currentUser.name);
    return me?.coTeachers || [];
  }, [currentUser, allUsers]);

  const visibleSubmissions = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') return submissions;
    return submissions.filter(s => {
      const sTeacher = s.teacherName || allUsers.find(u => u.name === s.studentName)?.teacherName;
      return sTeacher === myMainTeacherName;
    });
  }, [submissions, allUsers, currentUser, myMainTeacherName]);

  const classRoster = useMemo(() => {
    if (!currentUser) return [];
    let roster = [];
    if (currentUser.role === 'admin') {
      roster = allUsers.filter(u => u.role === 'student');
    } else {
      roster = allUsers.filter(u => u.role === 'student' && u.teacherName === myMainTeacherName);
    }
    return roster.sort((a, b) => a.name.localeCompare(b.name));
  }, [allUsers, currentUser, myMainTeacherName]);

  const teacherRoster = useMemo(() => {
    if (!currentUser || currentUser.role !== 'admin') return [];
    return allUsers.filter(u => u.role === 'teacher').sort((a, b) => a.name.localeCompare(b.name));
  }, [allUsers, currentUser]);

  const classStats = useMemo(() => {
    const stats = {};
    classRoster.forEach(student => {
      stats[student.name] = { name: student.name, categories: { 1: {}, 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] }, totalApprovals: 0 };
    });

    visibleSubmissions.forEach(sub => {
      if (!stats[sub.studentName]) {
        stats[sub.studentName] = { name: sub.studentName, categories: { 1: {}, 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] }, totalApprovals: 0 };
      }
      if (sub.status === 'approved') {
        stats[sub.studentName].totalApprovals++;
        if (sub.category === 1) {
          const subMonth = sub.month || (sub.date ? sub.date.substring(0, 7) : '미상');
          if (!stats[sub.studentName].categories[1][subMonth]) { stats[sub.studentName].categories[1][subMonth] = { hours: 0, count: 0 }; }
          stats[sub.studentName].categories[1][subMonth].hours += Number(sub.hours);
          stats[sub.studentName].categories[1][subMonth].count += 1;
        } else {
          stats[sub.studentName].categories[sub.category].push(sub);
        }
      }
    });

    Object.values(stats).forEach(student => {
      const reqM = getStudentReqMonths(student.name);
      const hasMetMonthlyGoal = reqM.length > 0 && reqM.every(month => {
        const monthData = student.categories[1][month];
        return monthData && monthData.hours >= 7;
      });
      let metCount = hasMetMonthlyGoal ? 1 : 0;
      for (let i = 2; i <= 7; i++) { if (student.categories[i].length > 0) metCount++; }
      student.metCount = metCount;
      student.isCertified = metCount === 7;
    });
    return Object.values(stats).sort((a, b) => b.metCount - a.metCount);
  }, [classRoster, visibleSubmissions]);

  const myStats = useMemo(() => {
    if (!currentUser || currentUser.role !== 'student') return null;
    return classStats.find(s => s.name === currentUser.name) || { name: currentUser.name, categories: { 1: {}, 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] }, metCount: 0, isCertified: false };
  }, [currentUser, classStats]);

  const sortedSubmissions = useMemo(() => {
    let filtered = filterCategory === 'all' ? visibleSubmissions : visibleSubmissions.filter(s => s.category === Number(filterCategory));
    let sorted = [...filtered];
    if (listSortOrder === 'nameAsc') sorted.sort((a, b) => a.studentName.localeCompare(b.studentName));
    else if (listSortOrder === 'nameDesc') sorted.sort((a, b) => b.studentName.localeCompare(a.studentName));
    else sorted.sort((a, b) => b.timestamp - a.timestamp);
    return sorted;
  }, [visibleSubmissions, filterCategory, listSortOrder]);

  const handleLogin = async (e) => {
    e.preventDefault(); setLoginError('');
    let targetId = '';
    if (loginTab === 'student') {
      const sNum = loginStudentNum.trim(); const sName = loginName.trim();
      if (!sNum || !sName) { setLoginError('학번과 이름을 모두 입력해주세요.'); return; }
      targetId = `${sNum} ${sName}`; 
    } else {
      const tName = loginName.trim();
      if (!tName) { setLoginError('선생님 이름 또는 ID를 입력해주세요.'); return; }
      targetId = tName;
    }
    const pwd = loginPassword.trim();
    if (!pwd || !firebaseUser) return;

    try {
      if (loginTab === 'teacher' && targetId === 'ycjhss' && pwd === 'didwptmd486!') {
        setCurrentUser({ role: 'admin', name: '전체관리자(ycjhss)' }); setView('teacher'); return;
      }
      const userSnap = await getUserDoc(targetId).get();
      if (loginTab === 'teacher') {
        if (userSnap.exists) {
          const uData = userSnap.data();
          if (uData.role !== 'teacher') { setLoginError('학생으로 등록된 이름입니다. 학생 탭을 이용해주세요.'); return; }
          if (!uData.password) { await getUserDoc(targetId).update({ password: pwd }); setCurrentUser({ role: 'teacher', name: targetId }); setView('teacher'); } 
          else if (uData.password === pwd) { setCurrentUser({ role: 'teacher', name: targetId }); setView('teacher'); } 
          else { setLoginError('비밀번호가 일치하지 않습니다.'); }
        } else { setLoginError('등록되지 않은 교사 계정입니다.'); }
      } else {
        if (!userSnap.exists) { setLoginError('명단에 없는 학번/이름입니다.'); return; }
        const uData = userSnap.data();
        if (uData.role !== 'student') { setLoginError('선생님으로 등록된 계정입니다.'); return; }
        if (!uData.password) { await getUserDoc(targetId).update({ password: pwd }); setCurrentUser({ role: 'student', name: targetId, teacherName: uData.teacherName }); setView('dashboard'); } 
        else if (uData.password === pwd) { setCurrentUser({ role: 'student', name: targetId, teacherName: uData.teacherName }); setView('dashboard'); } 
        else { setLoginError('비밀번호가 일치하지 않습니다.'); }
      }
    } catch (error) { setLoginError('로그인 중 오류가 발생했습니다.'); }
  };

  const handleLogout = () => { setCurrentUser(null); setLoginStudentNum(''); setLoginName(''); setLoginPassword(''); setLoginError(''); resetForm(); };
  const resetForm = () => { setFormCategory(1); setFormDate(new Date().toISOString().slice(0, 10)); setFormHours(''); setFormDescription(''); setEditingId(null); setSubmitMessage({ text: '', type: '' }); setFormStudentName(''); };

  const handleSubmitActivity = async (e) => {
    e.preventDefault();
    if (!firebaseUser || !currentUser) return;
    if (currentUser.role !== 'student' && !editingId && !formStudentName) { setSubmitMessage({ text: '대상 학생을 선택해주세요.', type: 'error' }); return; }
    setSubmitMessage({ text: editingId ? '수정 중...' : '제출 중...', type: 'loading' });

    try {
      if (editingId) {
        await getSubmissionDoc(editingId).update({ category: formCategory, date: formCategory === 1 ? formDate : null, month: formCategory === 1 ? formDate.substring(0, 7) : null, hours: formCategory === 1 ? Number(formHours) : null, description: formCategory === 1 ? '' : formDescription, updatedAt: Date.now() });
        setSubmitMessage({ text: '성공적으로 수정되었습니다!', type: 'success' });
      } else {
        await getSubmissionsRef().add({ studentName: currentUser.role === 'student' ? currentUser.name : formStudentName, teacherName: myMainTeacherName, category: formCategory, date: formCategory === 1 ? formDate : null, month: formCategory === 1 ? formDate.substring(0, 7) : null, hours: formCategory === 1 ? Number(formHours) : null, description: formCategory === 1 ? '' : formDescription, status: currentUser.role !== 'student' ? 'approved' : 'pending', timestamp: Date.now() });
        setSubmitMessage({ text: '성공적으로 제출되었습니다!', type: 'success' });
      }
      setTimeout(() => { resetForm(); setView(currentUser.role === 'student' ? 'dashboard' : 'teacher'); }, 1500);
    } catch (error) { setSubmitMessage({ text: '오류가 발생했습니다.', type: 'error' }); }
  };

  const handleEditClick = (sub) => {
    setEditingId(sub.id); setFormCategory(sub.category); setFormStudentName(sub.studentName);
    if (sub.category === 1) { setFormDate(sub.date || (sub.month ? `${sub.month}-01` : new Date().toISOString().slice(0, 10))); setFormHours(sub.hours?.toString() || ''); } 
    else { setFormDescription(sub.description || ''); }
    setView('submit');
  };

  const handleDelete = async (id) => { if (!firebaseUser) return; try { await getSubmissionDoc(id).delete(); } catch (error) {} };
  const handleReview = async (id, status) => { if (!firebaseUser) return; try { await getSubmissionDoc(id).update({ status }); } catch (error) {} };

  const handleUploadRoster = async () => {
    if (!uploadText.trim()) return; setUploadMessage('업로드 중...');
    const lines = uploadText.split('\n').map(n => n.trim()).filter(Boolean);
    let successCount = 0; let failCount = 0;
    try {
      for (const line of lines) {
        const parts = line.split(/[\s\t]+/);
        if (parts.length < 2) { failCount++; continue; }
        const docId = `${parts[0]} ${parts.slice(1).join(' ')}`;
        if (docId === 'ycjhss' || docId === currentUser.name) continue; 
        await getUserDoc(docId).set({ role: 'student', teacherName: myMainTeacherName }, { merge: true }); successCount++;
      }
      setUploadMessage(`성공적으로 ${successCount}명의 명단을 업데이트했습니다.` + (failCount > 0 ? ` (${failCount}건 오류 건너뜀)` : '')); setUploadText(''); setTimeout(() => setUploadMessage(''), 4000);
    } catch (error) { setUploadMessage('업로드 중 오류가 발생했습니다.'); }
  };

  const handleUploadTeacherRoster = async () => {
    if (!uploadTeacherText.trim()) return; setUploadTeacherMessage('업로드 중...');
    const lines = uploadTeacherText.split('\n').map(n => n.trim()).filter(Boolean); let successCount = 0;
    try {
      for (const name of lines) { if (name === 'ycjhss') continue; await getUserDoc(name).set({ role: 'teacher' }, { merge: true }); successCount++; }
      setUploadTeacherMessage(`성공적으로 ${successCount}명의 교사 명단을 등록했습니다.`); setUploadTeacherText(''); setTimeout(() => setUploadTeacherMessage(''), 4000);
    } catch (error) { setUploadTeacherMessage('오류가 발생했습니다.'); }
  };

  const handleAddCoTeacher = async () => {
    if (!coTeacherInput.trim() || !firebaseUser) return;
    try {
      const docRef = getUserDoc(currentUser.name); const docSnap = await docRef.get(); const currentCoTeachers = docSnap.exists ? (docSnap.data().coTeachers || []) : [];
      if (!currentCoTeachers.includes(coTeacherInput.trim())) { await docRef.set({ coTeachers: firebase.firestore.FieldValue.arrayUnion(coTeacherInput.trim()) }, { merge: true }); setUploadMessage(`부담임 선생님 추가됨.`); setCoTeacherInput(''); } 
      else { setUploadMessage(`이미 등록됨.`); }
      setTimeout(() => setUploadMessage(''), 3000);
    } catch (error) {}
  };

  const handleRemoveCoTeacher = async (nameToRemove) => { try { await getUserDoc(currentUser.name).set({ coTeachers: firebase.firestore.FieldValue.arrayRemove(nameToRemove) }, { merge: true }); setUploadMessage('해제되었습니다.'); setTimeout(() => setUploadMessage(''), 3000); } catch (error) {} };
  const handleResetPassword = async (name) => { try { await getUserDoc(name).update({ password: null }); setUploadMessage(`비밀번호 초기화됨.`); setTimeout(() => setUploadMessage(''), 3000); } catch (error) {} };
  const handleDeleteStudent = (name) => { setDeleteTarget({ type: 'student', name }); };
  const handleDeleteUser = (name) => { setDeleteTarget({ type: 'teacher', name }); };

  const executeDelete = async () => {
    if (!deleteTarget) return; const { type, name } = deleteTarget; setDeleteTarget(null);
    try {
      await getUserDoc(name).delete();
      if (type === 'student') { const userSubs = submissions.filter(s => s.studentName === name); for (const sub of userSubs) { await getSubmissionDoc(sub.id).delete(); } setUploadMessage(`삭제 완료.`); } 
      else { setUploadMessage(`삭제 완료.`); }
      setTimeout(() => setUploadMessage(''), 3000);
    } catch (error) {}
  };

  const exportToCSV = () => {
    const BOM = "\uFEFF"; let csvContent = BOM + "담당교사,학번_이름,항목,세부내용/시간,날짜(월),상태,제출일\n";
    sortedSubmissions.forEach(sub => {
      const catName = CATEGORIES.find(c => c.id === sub.category)?.title || '';
      const details = sub.category === 1 ? `${sub.hours}시간` : `"${(sub.description || '').replace(/"/g, '""')}"`;
      const status = sub.status === 'approved' ? '승인' : sub.status === 'rejected' ? '반려' : '대기';
      const displayDate = sub.category === 1 ? (sub.date || sub.month) : (sub.month || '-');
      csvContent += `"${sub.teacherName || '-'}",${sub.studentName},"${catName}",${details},${displayDate},${status},${new Date(sub.timestamp).toLocaleDateString()}\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }); const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "학급활동인증현황.csv"; document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const handleDownloadQR = () => { if (qrImageUrl) { const link = document.createElement('a'); link.download = '학급앱_QR.png'; link.href = qrImageUrl; link.click(); } };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50">로딩 중...</div>;

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-indigo-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex bg-gray-100 border-b border-gray-200">
            <button onClick={() => { setLoginTab('student'); setLoginError(''); }} className={`flex-1 py-4 font-bold text-sm ${loginTab === 'student' ? 'bg-white text-indigo-700 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>🧑‍🎓 학생 로그인</button>
            <button onClick={() => { setLoginTab('teacher'); setLoginError(''); }} className={`flex-1 py-4 font-bold text-sm ${loginTab === 'teacher' ? 'bg-white text-indigo-700 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>👨‍🏫 선생님 (관리자)</button>
          </div>
          <div className="p-8 space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                {loginTab === 'student' ? <Users size={32} /> : <ShieldAlert size={32} />}
              </div>
              <h1 className="text-2xl font-bold text-gray-800">학급 활동 인증 시스템</h1>
              <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                {loginTab === 'student' ? "학번, 이름, 비밀번호를 입력하세요.\n초기 접속 시 입력한 비밀번호로 설정됩니다." : "관리자가 사전에 등록한 이름으로만 접속 가능합니다.\n최초 접속 시 입력한 비밀번호로 고정됩니다."}
              </p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              {loginTab === 'student' ? (
                <div className="flex space-x-2">
                  <input type="text" value={loginStudentNum} onChange={(e) => setLoginStudentNum(e.target.value)} placeholder="학번 (예: 1101)" className="w-1/2 px-3 py-3 rounded-lg border focus:ring-2 focus:ring-indigo-500" required />
                  <input type="text" value={loginName} onChange={(e) => setLoginName(e.target.value)} placeholder="이름 (예: 홍길동)" className="w-1/2 px-3 py-3 rounded-lg border focus:ring-2 focus:ring-indigo-500" required />
                </div>
              ) : (
                <input type="text" value={loginName} onChange={(e) => setLoginName(e.target.value)} placeholder="선생님 이름 / 관리자 ID" className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-indigo-500" required />
              )}
              <div className="relative">
                <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="비밀번호" className="w-full px-4 py-3 pl-10 rounded-lg border focus:ring-2 focus:ring-indigo-500" required />
                <Lock size={18} className="absolute left-3 top-3.5 text-gray-400" />
              </div>
              {loginError && <div className="text-red-500 text-sm font-medium flex items-center bg-red-50 p-3 rounded-lg"><AlertCircle size={16} className="mr-2 shrink-0" /> {loginError}</div>}
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg mt-2">접속하기</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-gray-800">
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center space-x-2"><Award className="text-indigo-600" size={24} /><span className="font-bold text-lg hidden sm:block">학급 활동 인증 시스템</span></div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full">
              {currentUser.role === 'admin' ? '👑 전체 관리자' : currentUser.role === 'teacher' ? (currentUser.name === myMainTeacherName ? `👨‍🏫 ${currentUser.name} 선생님` : `👨‍🏫 ${currentUser.name} (${myMainTeacherName}반)`) : `🧑‍🎓 ${currentUser.name}`}
            </span>
            {currentUser.role !== 'student' && <button onClick={() => setShowQrModal(true)} className="text-gray-500 hover:text-indigo-600 p-2"><QrCodeIcon size={20} /></button>}
            <button onClick={handleLogout} className="text-gray-500 hover:text-gray-700 p-2"><LogOut size={18} /></button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {showQrModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm text-center relative">
              <button onClick={() => setShowQrModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={24} /></button>
              <h2 className="text-xl font-bold mb-2">접속 QR코드</h2>
              <div className="flex justify-center mb-6 p-4 bg-gray-50 rounded-xl min-h-[250px] items-center">
                {qrImageUrl ? <img src={qrImageUrl} alt="QR" className="w-[250px] h-[250px] rounded-lg shadow-sm" /> : <div>QR코드 생성 중...</div>}
              </div>
              <button onClick={handleDownloadQR} disabled={!qrImageUrl} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg flex items-center justify-center">
                <Download size={18} className="mr-2" /> 이미지로 저장하기
              </button>
            </div>
          </div>
        )}

        {deleteTarget && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm text-center relative">
              <AlertCircle size={40} className="mx-auto text-red-500 mb-4" />
              <h2 className="text-xl font-bold mb-2">명단 삭제 확인</h2>
              <p className="text-sm text-gray-600 mb-6">정말로 <strong>{deleteTarget.name}</strong> 삭제하시겠습니까?</p>
              <div className="flex space-x-3">
                <button onClick={() => setDeleteTarget(null)} className="flex-1 bg-gray-100 hover:bg-gray-200 font-bold py-2.5 rounded-lg">취소</button>
                <button onClick={executeDelete} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-lg">삭제하기</button>
              </div>
            </div>
          </div>
        )}

        <div className="flex space-x-2 border-b border-gray-200 pb-4 overflow-x-auto">
          {currentUser.role === 'student' && (
            <>
              <button onClick={() => { setView('dashboard'); resetForm(); }} className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${view === 'dashboard' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'}`}>내 인증 현황</button>
              <button onClick={() => setView('submit')} className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${view === 'submit' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'}`}>{editingId ? '활동 수정' : '활동 제출'}</button>
            </>
          )}
          {currentUser.role !== 'student' && (
            <>
              <button onClick={() => { setView('teacher'); setTeacherTab('pending'); resetForm(); }} className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${(view === 'teacher' && teacherTab === 'pending') ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'}`}>승인 대기 ({visibleSubmissions.filter(s => s.status === 'pending').length})</button>
              <button onClick={() => { setView('teacher'); setTeacherTab('all'); }} className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${(view === 'teacher' && teacherTab === 'all') ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'}`}>전체 조회</button>
              <button onClick={() => { setView('teacher'); setTeacherTab('students'); }} className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${(view === 'teacher' && teacherTab === 'students') ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'}`}>{currentUser.role === 'admin' ? '사용자 관리' : '학생 관리'}</button>
            </>
          )}
        </div>

        {/* 학생 화면 */}
        {view === 'dashboard' && currentUser.role === 'student' && myStats && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8">
              <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
                <div><h2 className="text-2xl font-bold">내 인증 현황</h2><p className="text-gray-500 text-sm mt-1">7가지 조건을 모두 달성하세요!</p></div>
                <div className="flex items-center bg-indigo-50 px-4 py-3 rounded-xl"><span className="text-indigo-800 font-bold text-xl mr-3">{myStats.metCount} / 7</span>{myStats.isCertified ? <span className="text-green-600 font-bold">완료!</span> : <span className="text-indigo-600 font-medium">진행 중</span>}</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {CATEGORIES.map(cat => {
                  const Icon = cat.icon; let isMet = false; let details = '';
                  
                  if (cat.id === 1) { 
                    const reqM = getStudentReqMonths(myStats.name);
                    isMet = reqM.length > 0 && reqM.every(m => myStats.categories[1][m] && myStats.categories[1][m].hours >= 7); 
                    
                    const detailsArr = BASE_REQUIRED_MONTHS.map(m => {
                      if (!reqM.includes(m)) return `${m.split('-')[1]}월(면제)`;
                      const d = myStats.categories[1][m];
                      return d ? `${m.split('-')[1]}월(${d.hours}h)` : `${m.split('-')[1]}월(X)`;
                    });
                    details = detailsArr.join(', '); 
                  } else { 
                    isMet = myStats.categories[cat.id].length > 0; 
                    if (isMet) details = `${myStats.categories[cat.id].length}회 참여`;
                  }

                  return (
                    <div key={cat.id} className={`flex items-start p-4 rounded-xl border ${isMet ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                      <div className={`p-2 rounded-lg mr-3 ${isMet ? 'bg-green-100 text-green-600' : 'bg-white text-gray-400'}`}>{isMet ? <CheckCircle size={20} /> : <Icon size={20} />}</div>
                      <div>
                        <h3 className={`font-semibold text-sm ${isMet ? 'text-green-900' : 'text-gray-700'}`}>{cat.title}</h3>
                        {cat.id === 1 && <p className="text-xs text-indigo-500 mt-1 font-medium">{details}</p>}
                        {cat.id !== 1 && isMet && <p className="text-xs text-indigo-500 mt-1 font-medium">{details}</p>}
                        {!isMet && <p className="text-xs text-red-400 mt-1">미달성</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8">
              <h2 className="text-xl font-bold mb-4">학급 상황판</h2>
              <div className="overflow-x-auto w-full">
                <table className="w-full text-sm border-collapse min-w-max">
                  <thead>
                    <tr className="bg-slate-50 border-b">
                      <th className="p-3 whitespace-nowrap min-w-[160px] text-center align-middle"><div className="inline-grid grid-cols-2 gap-2 w-36"><span className="text-center">학번</span><span className="text-center">이름</span></div></th>
                      <th className="p-3 text-center whitespace-nowrap align-middle">진행도</th>
                      <th className="p-3 text-center align-middle">1번<br/><span className="text-[10px] font-normal text-gray-500">자기주도학습</span></th>
                      {[2,3,4,5,6,7].map(n=><th key={n} className="p-3 text-center align-middle">{n}번</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {classStats.map(student => {
                      const reqM = getStudentReqMonths(student.name);
                      const cat1IsMet = reqM.length > 0 && reqM.every(m => student.categories[1][m] && student.categories[1][m].hours >= 7);

                      return (
                        <tr key={student.name} className={`border-b ${student.name === currentUser.name ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}>
                          <td className="p-3 font-medium whitespace-nowrap text-center align-middle">{formatName(student.name)}</td>
                          <td className="p-3 text-center font-bold align-middle text-indigo-600">{Math.round((student.metCount/7)*100)}%</td>
                          <td className="p-3 text-center align-middle">
                            <div className="flex flex-col items-center justify-center">
                              {cat1IsMet ? <CheckCircle size={16} className="text-green-500 mb-1" /> : <X size={16} className="text-gray-300 mb-1" />}
                              <span className="text-[10px] text-gray-500 whitespace-pre-wrap leading-tight max-w-[90px]">
                                {BASE_REQUIRED_MONTHS.map(m => {
                                  if (!reqM.includes(m)) {
                                      return <div key={m} className="text-gray-400 font-medium">{m.split('-')[1]}월: 면제</div>;
                                  }
                                  const d = student.categories[1][m];
                                  const isPass = d && d.hours >= 7;
                                  return <div key={m} className={isPass ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}>{m.split('-')[1]}월: {d ? d.hours : 0}h</div>;
                                })}
                              </span>
                            </div>
                          </td>
                          {[2,3,4,5,6,7].map(n => {
                            const isMet = student.categories[n].length > 0;
                            return <td key={n} className="p-3 text-center align-middle">{isMet ? <CheckCircle size={16} className="text-green-500 mx-auto"/> : '-'}</td>;
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8 mt-8">
              <h2 className="text-xl font-bold mb-4">내 전체 제출 기록</h2>
              <div className="space-y-3 mt-4">
                {submissions.filter(s => s.studentName === currentUser.name).map(sub => (
                  <div key={sub.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg border gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-indigo-700">[{CATEGORIES.find(c => c.id === sub.category)?.title}]</span>
                        {sub.status === 'pending' && <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded font-medium">검토 대기</span>}
                        {sub.status === 'approved' && <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded font-medium">승인 완료</span>}
                      </div>
                      <p className="text-sm text-gray-600">{sub.category === 1 ? <span className="font-semibold text-indigo-600">{sub.date || sub.month} ({sub.hours}시간)</span> : <span className="line-clamp-2">{sub.description}</span>}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={() => handleEditClick(sub)} className="p-2 text-blue-600 bg-blue-50 rounded-lg"><Edit2 size={18} /></button>
                      <button onClick={() => handleDelete(sub.id)} className="p-2 text-red-600 bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {view === 'submit' && (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-6">{editingId ? '활동 수정하기' : '새 활동 제출하기'}</h2>
            <form onSubmit={handleSubmitActivity} className="space-y-6">
              {currentUser.role !== 'student' && (
                <div>
                  <label className="block text-sm font-medium mb-2">학생 선택</label>
                  <select className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-indigo-500" value={formStudentName} onChange={(e) => setFormStudentName(e.target.value)} required disabled={editingId !== null}>
                    <option value="">선택하세요</option>
                    {classRoster.map(st => <option key={st.id || st.name} value={st.name}>{st.name}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-2">항목 선택</label>
                <select className="w-full px-4 py-3 rounded-lg border" value={formCategory} onChange={(e) => setFormCategory(Number(e.target.value))} disabled={editingId !== null}>
                  {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              {formCategory === 1 ? (
                <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium mb-2">활동 일자</label><input type="date" required value={formDate} onChange={(e)=>setFormDate(e.target.value)} className="w-full px-4 py-2 border rounded-lg" /></div>
                    <div><label className="block text-sm font-medium mb-2">학습 시간</label><input type="number" min="1" required value={formHours} onChange={(e)=>setFormHours(e.target.value)} className="w-full px-4 py-2 border rounded-lg" /></div>
                  </div>
                </div>
              ) : (
                <div><label className="block text-sm font-medium mb-2">내용 작성</label><textarea required rows="4" value={formDescription} onChange={(e)=>setFormDescription(e.target.value)} className="w-full px-4 py-3 border rounded-lg"></textarea></div>
              )}
              <div className="pt-2">
                <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700">{editingId ? '수정 완료하기' : '제출하기'}</button>
                {editingId && <button type="button" onClick={() => { resetForm(); setView(currentUser.role === 'student' ? 'dashboard' : 'teacher'); }} className="w-full mt-3 text-gray-500 hover:text-gray-700 underline text-sm">취소</button>}
              </div>
            </form>
          </div>
        )}

        {/* 선생님 대시보드 화면들 */}
        {view === 'teacher' && currentUser.role !== 'student' && (
          <div className="space-y-8">
            
            {/* ★ 1. 빠져있던 승인 대기 탭 코드 복구! ★ */}
            {teacherTab === 'pending' && (
              <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8">
                <h2 className="text-xl font-bold mb-4">승인 대기 중인 활동 ({visibleSubmissions.filter(s => s.status === 'pending').length}건)</h2>
                <div className="space-y-4">
                  {visibleSubmissions.filter(s => s.status === 'pending').map(sub => (
                    <div key={sub.id} className="p-4 border rounded-xl bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-lg">{formatName(sub.studentName, false)}</span>
                          <span className="text-sm font-semibold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">[{CATEGORIES.find(c => c.id === sub.category)?.title}]</span>
                        </div>
                        <p className="text-gray-700">{sub.category === 1 ? <span className="font-medium text-indigo-600">{sub.date || sub.month} ({sub.hours}시간)</span> : sub.description}</p>
                        <p className="text-xs text-gray-400 mt-2">제출일: {new Date(sub.timestamp).toLocaleString()}</p>
                      </div>
                      <div className="flex space-x-2 shrink-0">
                        <button onClick={() => handleReview(sub.id, 'approved')} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg flex items-center"><Check size={18} className="mr-1" /> 승인</button>
                        <button onClick={() => handleReview(sub.id, 'rejected')} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg flex items-center"><X size={18} className="mr-1" /> 반려</button>
                      </div>
                    </div>
                  ))}
                  {visibleSubmissions.filter(s => s.status === 'pending').length === 0 && <div className="text-center py-10 text-gray-500">대기 중인 활동이 없습니다.</div>}
                </div>
              </div>
            )}

            {/* 2. 전체 조회 탭 */}
            {teacherTab === 'all' && (
              <div className="bg-white rounded-2xl border p-6">
                <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
                  <h2 className="text-xl font-bold">전체 조회</h2>
                  <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
                    <button onClick={() => setAllViewMode('matrix')} className={`px-4 py-1.5 rounded-md text-sm font-bold ${allViewMode === 'matrix' ? 'bg-white text-indigo-700 shadow' : 'text-gray-500'}`}>학생별 종합 현황</button>
                    <button onClick={() => setAllViewMode('list')} className={`px-4 py-1.5 rounded-md text-sm font-bold ${allViewMode === 'list' ? 'bg-white text-indigo-700 shadow' : 'text-gray-500'}`}>상세 목록 조회</button>
                  </div>
                </div>

                {allViewMode === 'matrix' && (
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-sm border-collapse min-w-max">
                      <thead>
                        <tr className="bg-slate-50 border-y">
                          <th className="p-3 text-center align-middle"><div className="inline-grid grid-cols-2 gap-2 w-36"><span className="text-center">학번</span><span className="text-center">이름</span></div></th>
                          <th className="p-3 text-center w-16 align-middle">진행도</th>
                          {CATEGORIES.map(c => <th key={c.id} className="p-2 text-center text-xs align-middle" title={c.title}><div className="mb-1 font-bold">{c.id}.</div><div>{c.title}</div></th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {classStats.map(student => {
                          const studentReqMonths = getStudentReqMonths(student.name);
                          const cat1IsMet = studentReqMonths.length > 0 && studentReqMonths.every(m => student.categories[1][m] && student.categories[1][m].hours >= 7);
                          
                          const cat1Tooltip = BASE_REQUIRED_MONTHS.map(m => {
                            if (!studentReqMonths.includes(m)) return `${m.split('-')[1]}월: 전입/면제`;
                            const d = student.categories[1][m];
                            return d ? `${m.split('-')[1]}월: ${d.hours}h (${d.count}회)` : `${m.split('-')[1]}월: 미달성`;
                          }).join('\n');

                          return (
                            <tr key={student.name} className="border-b hover:bg-slate-50">
                              <td className="p-3 font-bold text-center align-middle">{formatName(student.name)}</td>
                              <td className="p-3 text-center font-bold text-indigo-600 align-middle">{Math.round((student.metCount / 7) * 100)}%</td>
                              <td className="p-3 text-center align-middle" title={cat1Tooltip}>
                                <div className="flex flex-col items-center justify-center cursor-help">
                                  {cat1IsMet ? <CheckCircle size={18} className="text-green-500 mb-1" /> : <X size={18} className="text-gray-300 mb-1" />}
                                  <span className="text-[10px] text-gray-500 whitespace-pre-wrap leading-tight max-w-[90px]">
                                    {BASE_REQUIRED_MONTHS.map(m => {
                                      if (!studentReqMonths.includes(m)) {
                                          return <div key={m} className="text-gray-400 font-medium">{m.split('-')[1]}월: 면제</div>;
                                      }
                                      const d = student.categories[1][m];
                                      const isPass = d && d.hours >= 7;
                                      return <div key={m} className={isPass ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}>{m.split('-')[1]}월: {d ? d.hours : 0}h</div>;
                                    })}
                                  </span>
                                </div>
                              </td>
                              {[2, 3, 4, 5, 6, 7].map(n => {
                                const catSubs = student.categories[n];
                                const isMet = catSubs.length > 0;
                                return (
                                  <td key={n} className="p-3 text-center align-middle">
                                    <div className="flex flex-col items-center justify-center cursor-help">
                                      {isMet ? <CheckCircle size={18} className="text-green-500 mb-1" /> : <X size={18} className="text-gray-300 mb-1" />}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
                
                {allViewMode === 'list' && (
                  <div className="overflow-x-auto w-full mt-4">
                    <table className="w-full text-sm border-collapse min-w-max">
                      <thead><tr className="bg-gray-100 border-y"><th className="p-3 text-center align-middle">이름</th><th className="p-3 text-left align-middle">세부내용/시간</th><th className="p-3 text-center align-middle">관리(수정/삭제)</th></tr></thead>
                      <tbody>
                        {sortedSubmissions.map(sub => (
                          <tr key={sub.id} className="border-b">
                            <td className="p-3 font-bold text-center align-middle">{formatName(sub.studentName)}</td>
                            <td className="p-3 text-left align-middle">{sub.category === 1 ? `${sub.date || sub.month} (${sub.hours}시간)` : sub.description}</td>
                            <td className="p-3 text-center align-middle">
                              <button onClick={() => handleEditClick(sub)} className="p-1 text-blue-600 mr-2"><Edit2 size={16}/></button>
                              <button onClick={()=>handleDelete(sub.id)} className="p-1 text-red-500"><Trash2 size={16}/></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ★ 3. 빠져있던 학생 관리 탭 코드 복구! ★ */}
            {teacherTab === 'students' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8">
                  <h2 className="text-xl font-bold mb-4">{currentUser.role === 'admin' ? '전체 사용자 관리' : '내 학급 학생 관리'}</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* 명단 업로드 (학생) */}
                    <div>
                      <h3 className="text-lg font-bold mb-3 flex items-center"><UserPlus size={20} className="mr-2 text-indigo-600" /> 일괄 명단 등록</h3>
                      <textarea rows="5" value={uploadText} onChange={(e) => setUploadText(e.target.value)} placeholder="학번 이름&#13;&#10;예시)&#13;&#10;1101 홍길동&#13;&#10;1102 김철수" className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 mb-3"></textarea>
                      <button onClick={handleUploadRoster} className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-lg hover:bg-indigo-700">학생 명단 업데이트</button>
                      {uploadMessage && <p className="text-sm font-medium text-indigo-600 mt-2">{uploadMessage}</p>}
                    </div>
                    
                    {/* 부담임/관리자 설정 */}
                    <div>
                       {currentUser.role === 'admin' ? (
                        <div>
                          <h3 className="text-lg font-bold mb-3 flex items-center"><ShieldAlert size={20} className="mr-2 text-indigo-600" /> 교사 명단 등록 (관리자용)</h3>
                          <textarea rows="5" value={uploadTeacherText} onChange={(e) => setUploadTeacherText(e.target.value)} placeholder="선생님 이름 입력 (줄바꿈으로 구분)&#13;&#10;예시)&#13;&#10;이순신&#13;&#10;강감찬" className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 mb-3"></textarea>
                          <button onClick={handleUploadTeacherRoster} className="w-full bg-slate-800 text-white font-bold py-2.5 rounded-lg hover:bg-slate-900">교사 명단 업데이트</button>
                          {uploadTeacherMessage && <p className="text-sm font-medium text-indigo-600 mt-2">{uploadTeacherMessage}</p>}
                        </div>
                      ) : (
                        <div>
                          <h3 className="text-lg font-bold mb-3 flex items-center"><UserCheck size={20} className="mr-2 text-indigo-600" /> 부담임 지정</h3>
                          <div className="flex space-x-2 mb-3">
                            <input type="text" value={coTeacherInput} onChange={(e) => setCoTeacherInput(e.target.value)} placeholder="부담임 선생님 이름" className="flex-1 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500" />
                            <button onClick={handleAddCoTeacher} className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700">추가</button>
                          </div>
                          <div className="space-y-2 mt-4">
                            <h4 className="text-sm font-bold text-gray-500">현재 등록된 부담임</h4>
                            {myCoTeachers.length > 0 ? myCoTeachers.map(ct => (
                              <div key={ct} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg border">
                                <span className="font-medium">{ct} 선생님</span>
                                <button onClick={() => handleRemoveCoTeacher(ct)} className="text-red-500 hover:text-red-700 text-sm">해제</button>
                              </div>
                            )) : <p className="text-sm text-gray-400">등록된 부담임이 없습니다.</p>}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 명단 리스트 */}
                  <div className="mt-8 border-t pt-8">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold">등록된 명단</h3>
                      <button onClick={exportToCSV} className="px-3 py-1.5 bg-green-100 text-green-700 font-bold text-sm rounded-lg hover:bg-green-200 flex items-center"><Download size={16} className="mr-1" /> 엑셀 다운로드</button>
                    </div>
                    
                    <div className="overflow-x-auto w-full">
                      <table className="w-full text-sm border-collapse">
                        <thead><tr className="bg-gray-100 border-y"><th className="p-3 text-center">이름</th><th className="p-3 text-center">역할/소속</th><th className="p-3 text-center">비밀번호</th><th className="p-3 text-center">삭제</th></tr></thead>
                        <tbody>
                          {currentUser.role === 'admin' && teacherRoster.map(t => (
                            <tr key={t.id} className="border-b bg-amber-50">
                              <td className="p-3 font-bold text-center">{t.name}</td>
                              <td className="p-3 text-center text-amber-700 font-medium">교사</td>
                              <td className="p-3 text-center"><button onClick={() => handleResetPassword(t.name)} className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded">초기화</button></td>
                              <td className="p-3 text-center"><button onClick={() => handleDeleteUser(t.name)} className="text-red-500 hover:text-red-700"><Trash2 size={16} className="mx-auto"/></button></td>
                            </tr>
                          ))}
                          {classRoster.map(st => (
                            <tr key={st.id} className="border-b">
                              <td className="p-3 font-bold text-center">{formatName(st.name, false)}</td>
                              <td className="p-3 text-center text-gray-500">{st.teacherName}반</td>
                              <td className="p-3 text-center"><button onClick={() => handleResetPassword(st.name)} className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded">초기화</button></td>
                              <td className="p-3 text-center"><button onClick={() => handleDeleteStudent(st.name)} className="text-red-500 hover:text-red-700"><Trash2 size={16} className="mx-auto"/></button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
