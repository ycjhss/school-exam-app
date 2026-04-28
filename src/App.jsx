import React, { useState, useRef, useEffect } from 'react';
import { 
  Save, CheckCircle, Trash2, Users, Check, AlertCircle, FileText, 
  Edit2, Search, Settings, Plus, X, BarChart3, Clock, List,
  Printer, Download, Lock, Unlock, Image as ImageIcon
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, doc, serverTimestamp, setDoc, deleteDoc } from 'firebase/firestore';

// 🚨 선생님의 파이어베이스 설정이 완벽하게 적용되었습니다! 🚨
const firebaseConfig = {
  apiKey: "AIzaSyCUgfIQSpk_ifhQTUlj0EMU6jrutoRMq3U",
  authDomain: "timetablc.firebaseapp.com",
  projectId: "timetablc",
  storageBucket: "timetablc.firebasestorage.app",
  messagingSenderId: "71494017661",
  appId: "1:71494017661:web:599b1471ba4a0663328714"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 앱 ID 고정
const appId = "school-exam-final-v2";

const defaultChecklistData = [
  { id: 1, type: 'category', text: '1. 시험 문제 출제 원칙' },
  { id: 2, type: 'item1', text: '가. 교육 과정에 근거한 출제', status: 'O' },
  { id: 3, type: 'item1', text: '나. 동 교과협의회를 통한 공동 출제', status: 'O' },
  { id: 4, type: 'item2', text: '1) 성취 기준 및 성취 수준에 맞는 출제', status: 'O' },
  { id: 5, type: 'item2', text: '2) 논술형 평가 문항 채점기준표 작성', status: 'O' },
  { id: 6, type: 'item1', text: '다. 예상 평균 점수 적합성 확인', status: 'O' },
  { id: 8, type: 'category', text: '2. 문항 출제 시 고려 사항' },
  { id: 9, type: 'item2', text: '1) 시판 참고서 문제와의 일치 여부', status: 'O' },
  { id: 10, type: 'item2', text: '2) 과년도 기출 문제와의 일치 여부', status: 'O' },
  { id: 12, type: 'item2', text: '3) 선행 출제 여부 동교과 상호 확인', status: 'O' }
];

// 요일 및 시간 포맷팅 함수
const formatDateTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const yy = String(date.getFullYear()).slice(2);
  const mm = date.getMonth() + 1;
  const dd = date.getDate();
  const day = days[date.getDay()];
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${yy}. ${mm}. ${dd}. (${day}) ${hh}:${min}`;
};

const SignaturePad = ({ onSave, resetTrigger }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = 160;
  };

  useEffect(() => {
    initCanvas();
    window.addEventListener('resize', initCanvas);
    return () => window.removeEventListener('resize', initCanvas);
  }, []);

  useEffect(() => { if (resetTrigger) clearCanvas(); }, [resetTrigger]);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDrawing = (e) => {
    e.preventDefault(); setIsDrawing(true);
    const coords = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath(); ctx.moveTo(coords.x, coords.y);
  };

  const draw = (e) => {
    e.preventDefault(); if (!isDrawing) return;
    const coords = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(coords.x, coords.y); ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) { setIsDrawing(false); onSave(canvasRef.current.toDataURL()); }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onSave(null);
  };

  return (
    <div className="w-full">
      <div className="border-2 border-gray-200 border-dashed rounded-2xl bg-white overflow-hidden relative h-40 shadow-inner group transition-all focus-within:border-blue-400">
        <canvas
          ref={canvasRef}
          className="w-full h-full touch-none cursor-crosshair"
          onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseOut={stopDrawing}
          onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}
        />
      </div>
      <div className="flex justify-between items-center mt-3 px-1">
        <span className="text-xs font-bold text-blue-600 flex items-center gap-1"><Edit2 size={12}/> 정자체로 서명해 주세요</span>
        <button onClick={clearCanvas} type="button" className="text-xs font-bold text-gray-400 hover:text-red-500 flex items-center gap-1 px-2 py-1 bg-white border border-gray-100 rounded-lg shadow-sm">
          <Trash2 size={12} /> 지우기
        </button>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [viewMode, setViewMode] = useState('teacher'); 
  
  // 비밀번호 인증 상태
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // 선택된 서명의 전체 공문서 출력용 팝업 상태
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const defaultGlobalSettings = {
    year: '2026', semester: '1', examOrder: '1', 
    adminPassword: '1234', 
    subjects: [
      { name: '국어', teachers: ['김국어', '이국어'] },
      { name: '수학', teachers: ['박수학', '최수학'] }
    ],
    checklist: defaultChecklistData
  };

  const [globalSettings, setGlobalSettings] = useState(defaultGlobalSettings);
  
  // Teacher State
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [signatureData, setSignatureData] = useState(null);
  const [resetSigCounter, setResetSigCounter] = useState(0);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Admin & Status State
  const [adminData, setAdminData] = useState(defaultGlobalSettings);
  const [newSubject, setNewSubject] = useState('');
  const [newTeachers, setNewTeachers] = useState({}); 
  const [adminMessage, setAdminMessage] = useState({ type: '', text: '' });
  const [bulkInput, setBulkInput] = useState(''); 
  const [allSignatures, setAllSignatures] = useState([]); 
  const [printStatuses, setPrintStatuses] = useState([]); 
  const [newChecklistType, setNewChecklistType] = useState('item1');
  const [newChecklistText, setNewChecklistText] = useState('');

  // 1. 인증 초기화
  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (e) { 
        console.error("인증 에러 (파이어베이스 키를 확인하세요):", e); 
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // 2. 관리자 설정 데이터 불러오기
  useEffect(() => {
    if (!user) return;
    return onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'global'), 
      (snap) => { 
        if (snap.exists()) {
          const data = snap.data();
          setGlobalSettings(prev => ({ ...prev, ...data })); 
          if (!isDataLoaded) {
            setAdminData(prev => ({ ...prev, ...data }));
            setIsDataLoaded(true);
          }
        } else {
          setIsDataLoaded(true);
        }
      },
      (err) => {
        console.error("데이터 불러오기 에러 (파이어베이스 설정을 확인하세요):", err);
      }
    );
  }, [user, isDataLoaded]);

  // 3. 서명 데이터 및 출력 상태 불러오기
  useEffect(() => {
    if (!user) return;
    
    const unsubSigs = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'individualSignatures'), 
      (snap) => {
        const sigs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAllSignatures(sigs);
      },
      (err) => console.error(err)
    );

    const unsubPrints = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'printStatuses'), 
      (snap) => {
        const records = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPrintStatuses(records);
      },
      (err) => console.error(err)
    );

    return () => { unsubSigs(); unsubPrints(); };
  }, [user]);

  const handleUnlock = (e) => {
    e.preventDefault();
    if (pinInput === globalSettings.adminPassword) {
      setIsUnlocked(true);
      setPinError(false);
      setPinInput('');
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  const handleTeacherSubmit = async (e) => {
    e.preventDefault();
    if (!signatureData || !user) return;
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'individualSignatures'), {
        year: String(globalSettings.year), semester: String(globalSettings.semester), examOrder: String(globalSettings.examOrder),
        subject: selectedSubject, teacherName: selectedTeacher, signatureData, createdAt: serverTimestamp(), uid: user.uid
      });
      setSaveSuccess(true); setSelectedTeacher(''); setSignatureData(null); setResetSigCounter(c => c+1);
      setTimeout(() => { setSaveSuccess(false); setSelectedSubject(''); }, 3000);
    } catch (e) { 
      // 🚨 가짜 성공 코드를 제거하고 진짜 에러를 표시합니다.
      console.error("제출 에러:", e);
      alert("데이터베이스 연결 오류입니다. 관리자에게 파이어베이스 설정값을 확인해 달라고 요청하세요!");
    }
    setIsSaving(false);
  };

  const handleAdminSave = async () => {
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'global'), adminData);
      setAdminMessage({ type: 'success', text: '설정이 안전하게 저장되었습니다.' });
      setTimeout(() => setAdminMessage({ type: '', text: '' }), 3000);
    } catch (e) {
      // 🚨 에러 내용을 명확히 표시합니다.
      console.error("저장 에러:", e);
      setAdminMessage({ type: 'error', text: '저장 실패: 파이어베이스 연결 설정이 올바른지 확인하세요.' });
      setTimeout(() => setAdminMessage({ type: '', text: '' }), 5000);
    }
  };

  const handleBulkPaste = () => {
    if(!bulkInput.trim()) return;
    const lines = bulkInput.split('\n');
    const newSubjectsMap = {};
    adminData.subjects.forEach(s => { newSubjectsMap[s.name] = new Set(s.teachers); });
    lines.forEach(line => {
      const parts = line.split('\t').map(p => p.trim()).filter(Boolean);
      if (parts.length > 0) {
        const subjectName = parts[0];
        if (!newSubjectsMap[subjectName]) newSubjectsMap[subjectName] = new Set();
        for (let i = 1; i < parts.length; i++) newSubjectsMap[subjectName].add(parts[i]);
      }
    });
    const updatedSubjects = Object.keys(newSubjectsMap).map(name => ({ name, teachers: Array.from(newSubjectsMap[name]) }));
    setAdminData(prev => ({ ...prev, subjects: updatedSubjects }));
    setBulkInput('');
    setAdminMessage({ type: 'success', text: '엑셀 명단이 적용되었습니다. 꼭 [전체 설정 저장하기]를 눌러주세요.' });
    setTimeout(() => setAdminMessage({ type: '', text: '' }), 4000);
  };

  const handleExportCSV = () => {
    let csv = "\uFEFF과목명,교사명,제출상태,서명시간\n";
    safeSubjects.forEach(subject => {
      const subjectSigs = currentExamSignatures.filter(s => s.subject === subject.name);
      subject.teachers.forEach(teacher => {
        const sig = subjectSigs.find(s => s.teacherName === teacher);
        const status = sig ? "제출완료" : "미제출";
        const date = sig?.createdAt?.toDate ? sig.createdAt.toDate().toLocaleString() : "";
        csv += `${subject.name},${teacher},${status},${date}\n`;
      });
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `출제검토현황_${globalSettings.year}_${globalSettings.semester}학기_${globalSettings.examOrder}차.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const togglePrintStatus = async (subjectName, isCurrentlyPrinted) => {
    const docId = `${globalSettings.year}_${globalSettings.semester}_${globalSettings.examOrder}_${subjectName}`;
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'printStatuses', docId);
    try {
      if (isCurrentlyPrinted) await deleteDoc(docRef);
      else await setDoc(docRef, { year: String(globalSettings.year), semester: String(globalSettings.semester), examOrder: String(globalSettings.examOrder), subjectName: subjectName, printedAt: new Date().toISOString() });
    } catch (error) {
      console.error("출력 상태 변경 오류:", error);
      alert("출력 상태 변경 중 오류가 발생했습니다. 파이어베이스 설정을 확인하세요.");
    }
  };

  // 관리자 설정 함수들
  const addSubject = () => {
    if(!newSubject.trim()) return;
    setAdminData(prev => ({ ...prev, subjects: [...prev.subjects, { name: newSubject.trim(), teachers: [] }] }));
    setNewSubject('');
  };
  const removeSubject = (subjectName) => {
    setAdminData(prev => ({ ...prev, subjects: prev.subjects.filter(s => s.name !== subjectName) }));
  };
  const addTeacherToSubject = (subjectName) => {
    const teacherName = newTeachers[subjectName]?.trim();
    if(!teacherName) return;
    setAdminData(prev => ({ ...prev, subjects: prev.subjects.map(s => s.name === subjectName ? { ...s, teachers: [...s.teachers, teacherName] } : s) }));
    setNewTeachers(prev => ({ ...prev, [subjectName]: '' }));
  };
  const removeTeacherFromSubject = (subjectName, teacherName) => {
    setAdminData(prev => ({ ...prev, subjects: prev.subjects.map(s => s.name === subjectName ? { ...s, teachers: s.teachers.filter(t => t !== teacherName) } : s) }));
  };
  const addChecklistItem = () => {
    if(!newChecklistText.trim()) return;
    const newItem = { id: Date.now(), type: newChecklistType, text: newChecklistText.trim(), status: 'O' };
    setAdminData(prev => ({ ...prev, checklist: [...(prev.checklist || defaultChecklistData), newItem] }));
    setNewChecklistText('');
  };
  const removeChecklistItem = (id) => {
    setAdminData(prev => ({ ...prev, checklist: (prev.checklist || defaultChecklistData).filter(item => item.id !== id) }));
  };
  const updateChecklistStatus = (id, newStatus) => {
    setAdminData(prev => ({
      ...prev,
      checklist: (prev.checklist || defaultChecklistData).map(item =>
        item.id === id ? { ...item, status: newStatus } : item
      )
    }));
  };

  // 기본 파생 데이터
  const safeSubjects = Array.isArray(globalSettings.subjects) ? globalSettings.subjects : [];
  const safeTeachers = safeSubjects.find(s => s.name === selectedSubject)?.teachers || [];
  const currentChecklist = globalSettings.checklist || defaultChecklistData;
  const currentExamSignatures = allSignatures.filter(s => 
    s.year === String(globalSettings.year) && s.semester === String(globalSettings.semester) && s.examOrder === String(globalSettings.examOrder)
  );

  const subjectSignaturesForTeacherView = currentExamSignatures.filter(s => s.subject === selectedSubject);
  const submittedNamesForSelectedSubject = subjectSignaturesForTeacherView.map(s => s.teacherName);
  const availableTeachers = safeTeachers.filter(t => !submittedNamesForSelectedSubject.includes(t));

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 selection:bg-blue-100 font-sans">
      
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 print:static print:block print:bg-white print:p-0 animate-fade-in overflow-y-auto" onClick={() => setSelectedSubmission(null)}>
          <div className="bg-white p-8 md:p-12 rounded-[2rem] max-w-3xl w-full shadow-2xl print:shadow-none print:rounded-none print:max-w-none print:w-full print:p-4 my-auto" onClick={e => e.stopPropagation()}>
            <div className="print:text-black">
              <h2 className="text-3xl font-black text-center mb-8 border-b-[3px] border-black pb-4 tracking-widest">출제 검토 확인서</h2>
              <div className="flex justify-between items-end mb-6 font-bold text-lg">
                <div>{selectedSubmission.year}년 {selectedSubmission.semester}학기 {selectedSubmission.examOrder}차 고사</div>
                <div className="text-right leading-relaxed text-xl">
                  <span className="inline-block w-16 text-gray-600">과목:</span> {selectedSubmission.subject} <br/>
                  <span className="inline-block w-16 text-gray-600">성명:</span> {selectedSubmission.teacherName}
                </div>
              </div>
              <div className="border-t-[3px] border-black border-b-[3px] py-6 mb-8">
                <ul className="space-y-4 text-lg">
                  {currentChecklist.map(item => (
                    <li key={item.id} className={`flex justify-between items-start ${item.type === 'category' ? 'font-black mt-6 first:mt-0 text-xl' : 'pl-4'}`}>
                      <span className={item.type === 'category' ? '' : 'relative before:content-["-"] before:absolute before:-left-3 pr-4 flex-1'}>
                        {item.text}
                      </span>
                      {item.type !== 'category' && (
                        <span className="font-black shrink-0 flex items-center gap-4 text-xl">
                          <span className={`w-10 h-10 flex items-center justify-center rounded-full ${(item.status !== 'X') ? 'border-[3px] border-black' : 'text-gray-400 font-medium'}`}>O</span>
                          <span className={`w-10 h-10 flex items-center justify-center rounded-full ${(item.status === 'X') ? 'border-[3px] border-black' : 'text-gray-400 font-medium'}`}>X</span>
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="text-center mb-8">
                <p className="text-xl font-bold mb-6">위 항목을 모두 확인하고 이상 없음을 확인합니다.</p>
                <p className="text-gray-600 mb-4 text-sm font-medium">
                  제출일시: {formatDateTime(selectedSubmission.createdAt?.toDate?.()?.toISOString() || new Date().toISOString())}
                </p>
                <div className="flex justify-center items-center gap-6 text-2xl font-black mt-12 relative">
                  확인자: {selectedSubmission.teacherName}
                  <div className="absolute ml-48 -mt-6">
                    <img src={selectedSubmission.signatureData} alt="서명" className="h-24 object-contain mix-blend-multiply" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-4 mt-12 pt-6 border-t border-gray-100 print:hidden">
              <button onClick={() => window.print()} className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-lg shadow-lg">
                <Printer size={22}/> 이 확인서 인쇄하기
              </button>
              <button onClick={() => setSelectedSubmission(null)} className="flex-1 py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-2 text-lg">
                <X size={22}/> 닫기
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`${selectedSubmission ? 'print:hidden' : ''} flex flex-col flex-1`}>
        <header className="bg-white/90 backdrop-blur-md sticky top-0 z-10 border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm print:hidden">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200 hidden sm:block">
              <FileText className="text-white" size={20}/>
            </div>
            <h1 className="text-xl font-black text-gray-800 tracking-tight">스마트 출제 검토</h1>
          </div>
          <div className="flex bg-gray-200/50 p-1.5 rounded-2xl border border-gray-200 overflow-x-auto custom-scrollbar">
            <button onClick={() => setViewMode('teacher')} className={`px-4 py-2 rounded-xl text-xs font-black transition-all duration-200 whitespace-nowrap ${viewMode==='teacher'?'bg-white text-blue-600 shadow-md transform scale-105':'text-gray-500 hover:text-gray-700'}`}>교사 서명</button>
            <button onClick={() => setViewMode('status')} className={`px-4 py-2 rounded-xl text-xs font-black transition-all duration-200 whitespace-nowrap ${viewMode==='status'?'bg-white text-emerald-600 shadow-md transform scale-105':'text-gray-500 hover:text-gray-700'}`}>제출 현황</button>
            <button onClick={() => setViewMode('admin')} className={`px-4 py-2 rounded-xl text-xs font-black transition-all duration-200 whitespace-nowrap ${viewMode==='admin'?'bg-white text-purple-600 shadow-md transform scale-105':'text-gray-500 hover:text-gray-700'}`}>관리자 설정</button>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-start p-4 md:p-8 animate-fade-in relative z-0 print:p-0">
          
          {(viewMode === 'status' || viewMode === 'admin') && !isUnlocked && (
            <div className="w-full max-w-sm bg-white rounded-[2rem] shadow-xl p-8 mt-12 animate-fade-in text-center border border-gray-100 print:hidden">
              <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="text-blue-500" size={28}/>
              </div>
              <h2 className="text-xl font-black text-gray-800 mb-2">관리자 암호 확인</h2>
              <p className="text-sm text-gray-500 mb-6 font-medium">초기 비밀번호는 <strong className="text-blue-600">1234</strong> 입니다.</p>
              <form onSubmit={handleUnlock}>
                <input type="password" value={pinInput} onChange={(e) => setPinInput(e.target.value)} placeholder="비밀번호 입력" className={`w-full p-4 bg-gray-50 border-2 rounded-xl text-center text-xl tracking-[0.5em] font-black outline-none transition-all ${pinError ? 'border-red-400 bg-red-50 text-red-600' : 'border-gray-200 focus:border-blue-500'}`} autoFocus />
                {pinError && <p className="text-xs font-bold text-red-500 mt-2">비밀번호가 일치하지 않습니다.</p>}
                <button type="submit" className="w-full py-4 mt-6 bg-gray-900 text-white rounded-xl font-black shadow-md hover:bg-black transition-all">확인</button>
              </form>
            </div>
          )}

          {viewMode === 'teacher' && (
            <div className="w-full max-w-md bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden border border-white relative mt-4">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-8 text-center relative overflow-hidden">
                <h2 className="text-2xl font-black mb-2 relative z-10">출제 검토 확인서</h2>
                <p className="text-blue-100 text-sm font-medium opacity-90 relative z-10">
                  {String(globalSettings.year)}년 {String(globalSettings.semester)}학기 {String(globalSettings.examOrder)}차 고사
                </p>
              </div>
              
              {saveSuccess ? (
                <div className="p-20 text-center animate-fade-in">
                  <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <Check className="text-green-600" size={48} strokeWidth={3}/>
                  </div>
                  <h3 className="text-2xl font-black text-gray-800">제출 완료!</h3>
                  <p className="text-gray-500 mt-3 text-sm font-medium">감사합니다. 화면이 곧 초기화됩니다.</p>
                </div>
              ) : (
                <form onSubmit={handleTeacherSubmit} className="p-8 space-y-6">
                  <div className="border border-gray-200 rounded-2xl h-64 flex flex-col bg-white overflow-hidden shadow-sm">
                    <div className="bg-blue-50/50 p-3 border-b border-gray-200 shrink-0 z-10">
                      <p className="text-xs font-black text-blue-700 text-center">
                        관리자가 확인한 아래 항목을 숙지했습니다.
                      </p>
                    </div>
                    <div className="p-4 overflow-y-auto custom-scrollbar flex-1 bg-gray-50">
                      <ul className="space-y-3 text-sm text-gray-600">
                        {currentChecklist.map(item => (
                          <li key={item.id} className={`flex justify-between items-start ${item.type === 'category' ? 'font-black text-gray-800 mt-5 border-b border-gray-200 pb-1 text-base' : 'pl-2 mt-2'}`}>
                            <span className={item.type === 'category' ? '' : 'relative before:content-["-"] before:absolute before:-left-2 before:text-gray-400 pl-2 pr-4 flex-1 leading-tight'}>
                              {item.text}
                            </span>
                            {item.type !== 'category' && (
                              <span className="flex gap-1.5 shrink-0 mt-0.5">
                                <span className={`w-5 h-5 flex items-center justify-center rounded border ${(item.status !== 'X') ? 'border-blue-500 bg-blue-50 text-blue-600 font-black' : 'border-gray-200 text-gray-300 font-bold'} text-[10px]`}>O</span>
                                <span className={`w-5 h-5 flex items-center justify-center rounded border ${(item.status === 'X') ? 'border-red-500 bg-red-50 text-red-600 font-black' : 'border-gray-200 text-gray-300 font-bold'} text-[10px]`}>X</span>
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="relative group">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 mb-1">Subject</label>
                      <select value={selectedSubject} onChange={e=>{setSelectedSubject(e.target.value); setSelectedTeacher('');}} className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-base font-bold focus:border-blue-500 focus:bg-white transition-all appearance-none outline-none shadow-sm" required>
                        <option value="">과목을 선택하세요</option>
                        {safeSubjects.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                      </select>
                      <div className="absolute right-4 bottom-4 pointer-events-none opacity-30"><Search size={18}/></div>
                    </div>

                    {selectedSubject && availableTeachers.length > 0 && (
                      <div className="animate-fade-in relative group">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 mb-1">Teacher</label>
                        <select value={selectedTeacher} onChange={e=>setSelectedTeacher(e.target.value)} className="w-full p-4 bg-blue-50/50 border-2 border-blue-100 rounded-2xl text-base font-bold text-blue-800 focus:border-blue-500 focus:bg-white transition-all appearance-none outline-none shadow-sm" required>
                          <option value="">성함을 선택하세요</option>
                          {availableTeachers.map(t=><option key={t} value={t}>{t}</option>)}
                        </select>
                        <div className="absolute right-4 bottom-4 pointer-events-none opacity-30"><Users size={18}/></div>
                      </div>
                    )}

                    {selectedSubject && availableTeachers.length === 0 && (
                      <div className="animate-fade-in p-4 bg-emerald-50 border-2 border-emerald-100 rounded-2xl text-center">
                        <span className="text-emerald-600 font-black text-sm flex items-center justify-center gap-2">
                          <CheckCircle size={18}/> 이 과목의 모든 교사가 제출을 완료했습니다.
                        </span>
                      </div>
                    )}

                    {selectedTeacher && (
                      <div className="animate-fade-in space-y-3 pt-2">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Signature</label>
                        <SignaturePad onSave={setSignatureData} resetTrigger={resetSigCounter} />
                        <button type="submit" disabled={isSaving || !signatureData} className="w-full py-5 bg-gray-900 text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-gray-200 hover:bg-black transition-all active:scale-95 disabled:bg-gray-300 flex items-center justify-center gap-2 mt-4">
                          {isSaving ? '제출 중...' : <><Save size={20}/> 확인 및 서명 제출</>}
                        </button>
                      </div>
                    )}
                  </div>
                </form>
              )}
            </div>
          )}

          {viewMode === 'status' && isUnlocked && (
            <div className="w-full max-w-4xl bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white p-8 md:p-10 animate-fade-in mt-4 print:shadow-none print:p-0 print:mt-0">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-gray-100 pb-6 print:border-b-2 print:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 p-3 rounded-2xl print:hidden"><BarChart3 className="text-emerald-600" size={24}/></div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-800">과목별 검토 제출 현황</h2>
                    <p className="text-gray-500 text-sm font-medium">
                      {String(globalSettings.year)}년 {String(globalSettings.semester)}학기 {String(globalSettings.examOrder)}차 고사
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 print:hidden">
                  <button onClick={handleExportCSV} className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold hover:bg-blue-100 transition-colors border border-blue-200">
                    <Download size={16} /> 엑셀 다운로드
                  </button>
                  <button onClick={() => window.print()} className="bg-gray-800 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold hover:bg-black transition-colors shadow-md">
                    <Printer size={16} /> 현황판 인쇄
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-2">
                {safeSubjects.map(subject => {
                  const subjectSignatures = currentExamSignatures.filter(s => s.subject === subject.name);
                  const submittedNames = subjectSignatures.map(s => s.teacherName);
                  const totalCount = subject.teachers.length;
                  const submittedCount = subject.teachers.filter(t => submittedNames.includes(t)).length;
                  const isComplete = totalCount > 0 && submittedCount === totalCount;
                  
                  const printRecord = printStatuses.find(p => 
                    p.year === String(globalSettings.year) && 
                    p.semester === String(globalSettings.semester) && 
                    p.examOrder === String(globalSettings.examOrder) && 
                    p.subjectName === subject.name
                  );

                  return (
                    <div key={subject.name} className={`relative p-6 rounded-3xl border-2 transition-all shadow-sm print:break-inside-avoid ${isComplete ? 'bg-emerald-50/50 border-emerald-100 print:border-gray-300 print:bg-white' : 'bg-white border-gray-200 print:border-gray-300'}`}>
                      <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2 print:border-gray-200">
                        <h3 className="text-lg font-black text-gray-800">{subject.name}</h3>
                        <div className={`px-3 py-1 rounded-full text-xs font-black ${isComplete ? 'bg-emerald-100 text-emerald-700 print:bg-gray-100 print:text-gray-800' : 'bg-gray-100 text-gray-600'}`}>
                          {submittedCount} / {totalCount} 명
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 mt-4">
                        {subject.teachers.length === 0 ? (
                          <span className="text-xs text-gray-400">등록된 교사가 없습니다.</span>
                        ) : (
                          subject.teachers.map(teacher => {
                            const sigRecord = subjectSignatures.find(s => s.teacherName === teacher);
                            const hasSubmitted = !!sigRecord;
                            
                            return (
                              <div key={teacher} className={`flex items-center justify-between p-2.5 rounded-xl border print:border-none print:p-1 print:border-b ${hasSubmitted ? 'bg-white border-emerald-200 print:bg-white' : 'bg-gray-50 border-gray-200'}`}>
                                <span className={`text-sm font-bold ${hasSubmitted ? 'text-gray-800' : 'text-gray-400'}`}>
                                  {teacher} 교사
                                </span>
                                {hasSubmitted ? (
                                  <button onClick={() => setSelectedSubmission(sigRecord)} className="flex items-center gap-1 text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-colors print:border-none print:bg-transparent print:text-gray-800">
                                    <FileText size={14} className="print:hidden"/> 서류 인쇄(확인)
                                  </button>
                                ) : (
                                  <span className="text-xs font-bold text-red-400 print:text-gray-500">미제출</span>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>

                      {isComplete && (
                        <div className="mt-5 pt-4 border-t border-emerald-100/60 print:border-t-2 print:border-gray-400 print:mt-4">
                          {printRecord ? (
                            <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-emerald-200 shadow-sm print:bg-transparent print:border-none print:p-0 print:shadow-none">
                              <span className="text-xs font-black text-emerald-700 flex items-center gap-1 print:text-gray-800">
                                <Printer size={14} className="print:hidden"/> 
                                출력 완료 ({formatDateTime(printRecord.printedAt)})
                              </span>
                              <button onClick={() => togglePrintStatus(subject.name, true)} className="text-gray-400 hover:text-red-500 print:hidden transition-colors" title="출력 표시 취소">
                                <X size={16}/>
                              </button>
                            </div>
                          ) : (
                            <div className="print:hidden">
                              <button onClick={() => togglePrintStatus(subject.name, false)} className="w-full py-2.5 bg-gray-800 text-white font-bold text-xs rounded-xl hover:bg-black transition-transform active:scale-95 flex items-center justify-center gap-1 shadow-md">
                                <CheckCircle size={16}/> 이 과목 출력 완료 표시
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {safeSubjects.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-3xl">
                  <p className="text-gray-500 font-bold">관리자 화면에서 과목과 교사 명단을 먼저 등록해 주세요.</p>
                </div>
              )}
            </div>
          )}
          
          {/* 3. 관리자 설정 화면 */}
          {viewMode === 'admin' && isUnlocked && (
            <div className="w-full max-w-2xl bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white p-8 md:p-10 animate-fade-in mt-4 print:hidden">
              <div className="flex justify-between items-start mb-8 border-b border-gray-100 pb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-3 rounded-2xl"><Settings className="text-purple-600" size={24}/></div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-800">전체 환경 설정</h2>
                    <p className="text-gray-500 text-sm font-medium">학교의 시험 정보와 과목/교사를 영구 보관합니다.</p>
                  </div>
                </div>
                <button onClick={() => setIsUnlocked(false)} className="text-xs text-gray-400 flex items-center gap-1 font-bold hover:text-gray-600"><Lock size={12}/> 잠그기</button>
              </div>

              {adminMessage.text && (
                <div className={`p-4 rounded-2xl mb-6 text-sm font-bold flex items-center gap-2 ${adminMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {adminMessage.type === 'success' ? <CheckCircle size={18}/> : <AlertCircle size={18}/>}
                  {adminMessage.text}
                </div>
              )}

              <div className="space-y-8">
                
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-black text-gray-500 mb-2">연도</label>
                    <input type="text" value={adminData.year} onChange={e=>setAdminData({...adminData, year: e.target.value})} className="w-full p-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-center font-bold focus:border-purple-500 outline-none"/>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-500 mb-2">학기</label>
                    <input type="text" value={adminData.semester} onChange={e=>setAdminData({...adminData, semester: e.target.value})} className="w-full p-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-center font-bold focus:border-purple-500 outline-none"/>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-500 mb-2">시험 차수</label>
                    <input type="text" value={adminData.examOrder} onChange={e=>setAdminData({...adminData, examOrder: e.target.value})} className="w-full p-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-center font-bold focus:border-purple-500 outline-none"/>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-purple-600 mb-2">관리자 비밀번호</label>
                    <input type="text" value={adminData.adminPassword || '1234'} onChange={e=>setAdminData({...adminData, adminPassword: e.target.value})} className="w-full p-3 bg-purple-50 border-2 border-purple-100 text-purple-700 rounded-xl text-center font-black focus:border-purple-500 outline-none"/>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-lg font-black text-gray-800 mb-4 flex items-center gap-2">
                    <List size={20} className="text-purple-500"/> 출제 검토 항목(체크리스트) 관리
                  </h3>
                  <div className="bg-gray-50 border-2 border-gray-100 rounded-2xl p-4">
                    <div className="space-y-2 mb-4 max-h-80 overflow-y-auto custom-scrollbar pr-2">
                      {(adminData.checklist || defaultChecklistData).map(item => (
                        <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-200 shadow-sm transition-all hover:border-purple-200">
                          <span className={item.type === 'category' ? 'font-black text-gray-800' : 'text-sm text-gray-600 pl-2 flex-1'}>
                            {item.text}
                          </span>
                          <div className="flex items-center gap-3">
                            {item.type !== 'category' && (
                              <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                                <button onClick={() => updateChecklistStatus(item.id, 'O')} className={`px-3 py-1 text-xs font-black rounded-md transition-colors ${item.status !== 'X' ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-400 hover:bg-gray-200'}`}>O</button>
                                <button onClick={() => updateChecklistStatus(item.id, 'X')} className={`px-3 py-1 text-xs font-black rounded-md transition-colors ${item.status === 'X' ? 'bg-red-500 text-white shadow-sm' : 'text-gray-400 hover:bg-gray-200'}`}>X</button>
                              </div>
                            )}
                            <button onClick={() => removeChecklistItem(item.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1" title="삭제">
                              <Trash2 size={16}/>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 pt-4 border-t border-gray-200">
                      <select value={newChecklistType} onChange={e=>setNewChecklistType(e.target.value)} className="p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-purple-500 font-bold text-gray-700">
                        <option value="category">대분류 (제목)</option>
                        <option value="item1">일반 항목</option>
                      </select>
                      <input type="text" value={newChecklistText} onChange={e=>setNewChecklistText(e.target.value)} placeholder="검토 항목 내용 입력" className="flex-1 p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-purple-500"/>
                      <button type="button" onClick={addChecklistItem} className="bg-gray-800 text-white px-4 rounded-xl font-bold hover:bg-black transition-all shadow-md active:scale-95 whitespace-nowrap">
                        항목 추가
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-lg font-black text-gray-800 mb-4 flex items-center gap-2"><Users size={20} className="text-purple-500"/> 과목 및 교사 명단 보관함</h3>

                  <div className="mb-6 p-5 bg-purple-50/50 border border-purple-100 rounded-2xl">
                    <h4 className="text-sm font-black text-purple-900 mb-2 flex items-center gap-2">
                      <FileText size={16}/> 엑셀 명단 대량 붙여넣기
                    </h4>
                    <p className="text-xs text-purple-700 mb-3 opacity-80">
                      엑셀에서 <strong>[과목명] [교사명1] [교사명2]...</strong> 형태의 표를 복사해 아래에 붙여넣고 적용 버튼을 누르세요.
                    </p>
                    <textarea
                      value={bulkInput}
                      onChange={e => setBulkInput(e.target.value)}
                      placeholder="예시)&#13;&#10;국어&#9;홍길동&#9;이순신"
                      className="w-full h-24 p-3 bg-white border border-purple-200 rounded-xl text-sm outline-none focus:border-purple-500 resize-none custom-scrollbar"
                    />
                    <button onClick={handleBulkPaste} type="button" className="mt-3 px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-700 transition-all shadow-sm active:scale-95">
                      명단 일괄 적용하기
                    </button>
                  </div>
                  
                  <div className="flex gap-2 mb-6">
                    <input type="text" value={newSubject} onChange={e=>setNewSubject(e.target.value)} placeholder="새 과목 직접 추가 (예: 역사)" className="flex-1 p-3 bg-white border-2 border-gray-200 rounded-xl text-sm font-bold focus:border-purple-500 outline-none"/>
                    <button onClick={addSubject} className="bg-gray-800 text-white px-5 rounded-xl font-bold hover:bg-black transition-all shadow-md active:scale-95 whitespace-nowrap">과목 추가</button>
                  </div>

                  <div className="space-y-4">
                    {adminData.subjects.map(subject => (
                      <div key={subject.name} className="bg-gray-50 border-2 border-gray-100 rounded-2xl p-4">
                        <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-3">
                          <span className="font-black text-lg text-purple-900">{subject.name}</span>
                          <button onClick={() => removeSubject(subject.name)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={16}/></button>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {subject.teachers.map(teacher => (
                            <span key={teacher} className="bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-sm font-bold text-gray-700 flex items-center gap-2 shadow-sm">
                              {teacher}
                              <button onClick={()=>removeTeacherFromSubject(subject.name, teacher)} className="text-gray-400 hover:text-red-500"><X size={14}/></button>
                            </span>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <input type="text" value={newTeachers[subject.name] || ''} onChange={e=>setNewTeachers({...newTeachers, [subject.name]: e.target.value})} placeholder="교사 성함 직접 추가" className="flex-1 p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:border-purple-500 outline-none"/>
                          <button onClick={()=>addTeacherToSubject(subject.name)} className="bg-gray-200 text-gray-700 px-4 rounded-lg font-bold hover:bg-gray-300 transition-all text-sm flex items-center gap-1"><Plus size={16}/> 추가</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button onClick={handleAdminSave} className="w-full py-5 bg-purple-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-purple-200 hover:bg-purple-700 transition-all active:scale-95 flex items-center justify-center gap-2 mt-8">
                  <Save size={24}/> 전체 설정 저장하기 (데이터 보존)
                </button>

              </div>
            </div>
          )}
        </main>
        
        <footer className="py-8 text-center print:hidden mt-auto">
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Smart Review System FINAL EDITION</p>
        </footer>
      </div>
    </div>
  );
}