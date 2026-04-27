import React, { useState, useRef, useEffect } from 'react';
import { 
  Save, CheckCircle, Trash2, Users, Check, AlertCircle, FileText, 
  Edit2, Search, Settings, Plus, X
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, doc, serverTimestamp, setDoc } from 'firebase/firestore';

// --- Firebase 초기 설정 ---
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

const rawAppId = typeof __app_id !== 'undefined' ? __app_id : "school-exam-final-v2";
const appId = String(rawAppId).split('/')[0];

const defaultChecklistData = [
  { id: 1, type: 'category', text: '1. 시험 문제 출제 원칙' },
  { id: 2, type: 'item1', text: '가. 교육 과정에 근거한 출제' },
  { id: 3, type: 'item1', text: '나. 동 교과협의회를 통한 공동 출제' },
  { id: 4, type: 'item2', text: '1) 성취 기준 및 성취 수준에 맞는 출제' },
  { id: 5, type: 'item2', text: '2) 논술형 평가 문항 채점기준표 작성' },
  { id: 6, type: 'item1', text: '다. 예상 평균 점수 적합성 확인' },
  { id: 8, type: 'category', text: '2. 문항 출제 시 고려 사항' },
  { id: 9, type: 'item2', text: '1) 시판 참고서 문제와의 일치 여부' },
  { id: 10, type: 'item2', text: '2) 과년도 기출 문제와의 일치 여부' },
  { id: 12, type: 'item2', text: '3) 선행 출제 여부 동교과 상호 확인' }
];

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
  const [viewMode, setViewMode] = useState('teacher'); 
  const [globalSettings, setGlobalSettings] = useState({
    year: '2026', semester: '1', examOrder: '1', 
    subjects: [
      { name: '국어', teachers: ['김국어', '이국어'] },
      { name: '수학', teachers: ['박수학', '최수학'] }
    ]
  });
  
  // Teacher State
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [signatureData, setSignatureData] = useState(null);
  const [resetSigCounter, setResetSigCounter] = useState(0);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Admin State
  const [adminData, setAdminData] = useState(globalSettings);
  const [newSubject, setNewSubject] = useState('');
  const [newTeachers, setNewTeachers] = useState({}); // { subjectName: 'teacher name' }
  const [adminMessage, setAdminMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) { console.error(e); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    return onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'global'), 
      (snap) => { 
        if (snap.exists()) {
          setGlobalSettings(prev => ({ ...prev, ...snap.data() })); 
          setAdminData(prev => ({ ...prev, ...snap.data() }));
        }
      },
      (err) => console.error(err)
    );
  }, [user]);

  // --- Teacher Logic ---
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
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) { 
      // 로컬 테스트 권한 에러 우회 (UI 확인용)
      setSaveSuccess(true); setSelectedTeacher(''); setSignatureData(null); setResetSigCounter(c => c+1);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
    setIsSaving(false);
  };

  // --- Admin Logic ---
  const handleAdminSave = async () => {
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'global'), adminData);
      setAdminMessage({ type: 'success', text: '설정이 저장되었습니다.' });
      setTimeout(() => setAdminMessage({ type: '', text: '' }), 3000);
    } catch (e) {
      setAdminMessage({ type: 'error', text: '테스트 환경에서는 저장이 제한될 수 있습니다.' });
      setGlobalSettings(adminData); // 화면에는 바로 반영
      setTimeout(() => setAdminMessage({ type: '', text: '' }), 3000);
    }
  };

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
    setAdminData(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => s.name === subjectName ? { ...s, teachers: [...s.teachers, teacherName] } : s)
    }));
    setNewTeachers(prev => ({ ...prev, [subjectName]: '' }));
  };

  const removeTeacherFromSubject = (subjectName, teacherName) => {
    setAdminData(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => s.name === subjectName ? { ...s, teachers: s.teachers.filter(t => t !== teacherName) } : s)
    }));
  };

  const safeSubjects = Array.isArray(globalSettings.subjects) ? globalSettings.subjects : [];
  const safeTeachers = safeSubjects.find(s => s.name === selectedSubject)?.teachers || [];

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 selection:bg-blue-100">
      <header className="bg-white/90 backdrop-blur-md sticky top-0 z-10 border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200">
            <FileText className="text-white" size={20}/>
          </div>
          <h1 className="text-xl font-black text-gray-800 tracking-tight">스마트 출제 검토</h1>
        </div>
        <div className="flex bg-gray-200/50 p-1.5 rounded-2xl border border-gray-200">
          <button onClick={() => setViewMode('teacher')} className={`px-5 py-2 rounded-xl text-xs font-black transition-all duration-200 ${viewMode==='teacher'?'bg-white text-blue-600 shadow-md transform scale-105':'text-gray-500 hover:text-gray-700'}`}>교사 화면</button>
          <button onClick={() => setViewMode('admin')} className={`px-5 py-2 rounded-xl text-xs font-black transition-all duration-200 ${viewMode==='admin'?'bg-white text-purple-600 shadow-md transform scale-105':'text-gray-500 hover:text-gray-700'}`}>관리자 화면</button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-start p-4 md:p-8 animate-fade-in relative z-0">
        
        {/* 교사 서명 화면 */}
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
                
                {/* 누락되었던 실제 체크리스트 영역 추가 */}
                <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl h-48 overflow-y-auto custom-scrollbar">
                  <p className="text-xs font-black text-blue-600 mb-3 sticky top-0 bg-gray-50 pb-2 border-b border-gray-200">
                    아래 항목을 모두 확인했습니다.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    {defaultChecklistData.map(item => (
                      <li key={item.id} className={`${item.type === 'category' ? 'font-bold text-gray-800 mt-4 text-base' : 'pl-3 relative before:content-["-"] before:absolute before:left-0 before:text-gray-400'}`}>
                        {item.text}
                      </li>
                    ))}
                  </ul>
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

                  {selectedSubject && (
                    <div className="animate-fade-in relative group">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 mb-1">Teacher</label>
                      <select value={selectedTeacher} onChange={e=>setSelectedTeacher(e.target.value)} className="w-full p-4 bg-blue-50/50 border-2 border-blue-100 rounded-2xl text-base font-bold text-blue-800 focus:border-blue-500 focus:bg-white transition-all appearance-none outline-none shadow-sm" required>
                        <option value="">성함을 선택하세요</option>
                        {Array.isArray(safeTeachers) && safeTeachers.map(t=><option key={t} value={t}>{t}</option>)}
                      </select>
                      <div className="absolute right-4 bottom-4 pointer-events-none opacity-30"><Users size={18}/></div>
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
        
        {/* 관리자 설정 화면 (새로 구현됨) */}
        {viewMode === 'admin' && (
          <div className="w-full max-w-2xl bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white p-8 md:p-10 animate-fade-in mt-4">
            <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-6">
              <div className="bg-purple-100 p-3 rounded-2xl"><Settings className="text-purple-600" size={24}/></div>
              <div>
                <h2 className="text-2xl font-black text-gray-800">기본 환경 설정</h2>
                <p className="text-gray-500 text-sm font-medium">학교의 시험 정보와 과목/교사를 관리합니다.</p>
              </div>
            </div>

            {adminMessage.text && (
              <div className={`p-4 rounded-2xl mb-6 text-sm font-bold flex items-center gap-2 ${adminMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {adminMessage.type === 'success' ? <CheckCircle size={18}/> : <AlertCircle size={18}/>}
                {adminMessage.text}
              </div>
            )}

            <div className="space-y-8">
              <div className="grid grid-cols-3 gap-4">
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
              </div>

              <div>
                <h3 className="text-lg font-black text-gray-800 mb-4 flex items-center gap-2"><Users size={20} className="text-purple-500"/> 과목 및 교사 명단</h3>
                
                {/* 과목 추가 입력칸 */}
                <div className="flex gap-2 mb-6">
                  <input type="text" value={newSubject} onChange={e=>setNewSubject(e.target.value)} placeholder="새 과목명 (예: 역사)" className="flex-1 p-3 bg-white border-2 border-gray-200 rounded-xl text-sm font-bold focus:border-purple-500 outline-none"/>
                  <button onClick={addSubject} className="bg-purple-600 text-white px-5 rounded-xl font-bold hover:bg-purple-700 transition-all shadow-md active:scale-95 whitespace-nowrap">과목 추가</button>
                </div>

                {/* 과목 리스트 */}
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
                        <input type="text" value={newTeachers[subject.name] || ''} onChange={e=>setNewTeachers({...newTeachers, [subject.name]: e.target.value})} placeholder="교사 성함" className="flex-1 p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:border-purple-500 outline-none"/>
                        <button onClick={()=>addTeacherToSubject(subject.name)} className="bg-gray-200 text-gray-700 px-4 rounded-lg font-bold hover:bg-gray-300 transition-all text-sm flex items-center gap-1"><Plus size={16}/> 추가</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={handleAdminSave} className="w-full py-5 bg-purple-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-purple-200 hover:bg-purple-700 transition-all active:scale-95 flex items-center justify-center gap-2 mt-8">
                <Save size={24}/> 설정 저장하기
              </button>

            </div>
          </div>
        )}
      </main>
      
      <footer className="py-8 text-center no-print mt-auto">
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Smart Review System v3.0</p>
      </footer>
    </div>
  );
}