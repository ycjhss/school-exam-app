import React, { useState, useRef, useEffect } from 'react';
import { 
  Save, CheckCircle, Trash2, Users, Check, AlertCircle, FileText, 
  Edit2, Search, Settings, Plus, X, BarChart3, Clock, List,
  Printer, Download, Lock, Unlock, Image as ImageIcon, History
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, doc, serverTimestamp, setDoc, deleteDoc } from 'firebase/firestore';

// 🚨 파이어베이스 설정 (선생님의 값 유지됨) 🚨
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

const appId = "school-exam-final-v2";

const defaultChecklistData = [
  { id: 1, type: 'category', text: '1. 시험 문제 출제 원칙' },
  { id: 2, type: 'item1', text: '가. 교육 과정에 근거한 출제', status: 'O' },
  { id: 3, type: 'category', text: '나. 동 교과협의회를 통한 출제 계획 수립 및 공동 출제' },
  { id: 4, type: 'item2', text: '1) 과목별 성취 기준 성취 수준에 맞는 출제', status: 'O' },
  { id: 5, type: 'item2', text: '2) 논술형 평가 문항 출제 시 채점기준표 작성 여부', status: 'O' },
  { id: 6, type: 'item1', text: '다. 문항정보표 및 문항 분석 자료 작성 및 활용 여부 확인', status: 'O' },
  { id: 7, type: 'item1', text: '라. 예상 평균 점수를 제시하고 그에 적합한 난이도의 문제 출제 확인', status: 'O' },
  { id: 8, type: 'category', text: '마. 문항 출제 시 고려해야 할 사항' },
  { id: 9, type: 'item2', text: '1) 시판되는 참고서 문제와의 일치 여부 확인', status: 'O' },
  { id: 10, type: 'item2', text: '2) 인터넷 탑재 문제와의 일치 여부 확인', status: 'O' },
  { id: 11, type: 'item2', text: '3) 과년도 출제 문제와의 일치 여부 확인', status: 'O' },
  { id: 12, type: 'item2', text: '4) 편성된 교육과정과 일치하며, 선행 출제 여부에 대한 동교과 상호 확인', status: 'O' },
  { id: 13, type: 'item2', text: '5) 동학과 학급 간 출제 범위 통일 및 유사 선택교과 간 난이도 조정 여부 확인', status: 'O' },
  { id: 14, type: 'item2', text: '6) 문항 곤란도가 낮은 문항에 높은 배점(역배점) 하지 않도록 함', status: 'O' },
  { id: 15, type: 'category', text: '2. 논술형 평가의 세부 출제 원칙' },
  { id: 16, type: 'item1', text: '가. 단순 지식의 양, 암기 능력, 기억 능력 등을 측정하는 문항 지양', status: 'O' },
  { id: 17, type: 'item1', text: '나. 해결된 문제의 \'질\'을 측정하는 역량검사 지향', status: 'O' },
  { id: 18, type: 'item1', text: '다. 하위문항의 개수를 분명하게 인식하도록 출제', status: 'O' }
];

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
  
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [viewingExamKey, setViewingExamKey] = useState(''); // 💡 과거 기록 조회를 위한 상태 추가

  const defaultGlobalSettings = {
    year: '2026', semester: '1', examName: '1차 정기시험', documentDate: '2026. 4. 28.',
    adminPassword: '1234', 
    subjects: [
      { name: '국어', teachers: ['김국어', '이국어'] },
      { name: '수학', teachers: ['박수학', '최수학'] }
    ],
    checklist: defaultChecklistData
  };

  const [globalSettings, setGlobalSettings] = useState(defaultGlobalSettings);
  
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [signatureData, setSignatureData] = useState(null);
  const [resetSigCounter, setResetSigCounter] = useState(0);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteStep, setDeleteStep] = useState(0); // 교사 서명 삭제 확인 스텝
  
  const [adminData, setAdminData] = useState(defaultGlobalSettings);
  const [newSubject, setNewSubject] = useState('');
  const [newTeachers, setNewTeachers] = useState({}); 
  const [adminMessage, setAdminMessage] = useState({ type: '', text: '' });
  const [bulkInput, setBulkInput] = useState(''); 
  const [allSignatures, setAllSignatures] = useState([]); 
  const [printStatuses, setPrintStatuses] = useState([]); 
  const [newChecklistType, setNewChecklistType] = useState('item1');
  const [newChecklistText, setNewChecklistText] = useState('');

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          try {
            await signInWithCustomToken(auth, __initial_auth_token);
          } catch (tokenError) {
            await signInAnonymously(auth);
          }
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
          const data = snap.data();
          setGlobalSettings(prev => ({ ...prev, ...data })); 
          if (!isDataLoaded) {
            setAdminData(prev => ({ ...prev, ...data }));
            setIsDataLoaded(true);
            setViewingExamKey(`${data.year}|${data.semester}|${data.examName}`); // 현황판 초기값을 현재 설정으로 세팅
          }
        } else {
          setIsDataLoaded(true);
        }
      },
      (err) => console.error(err)
    );
  }, [user, isDataLoaded]);

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
    // 💡 과거 데이터에 비밀번호가 없었을 경우를 대비해 기본값 '1234'로 안전하게 비교합니다.
    const currentPassword = globalSettings.adminPassword || '1234';
    if (pinInput === currentPassword) {
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
      // 💡 서명 제출 시 현재 설정된 체크리스트 스냅샷을 함께 영구 보존합니다.
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'individualSignatures'), {
        year: String(globalSettings.year), 
        semester: String(globalSettings.semester), 
        examName: String(globalSettings.examName),
        subject: selectedSubject, 
        teacherName: selectedTeacher, 
        signatureData,
        checklistSnapshot: globalSettings.checklist || defaultChecklistData, // 스냅샷 백업
        createdAt: serverTimestamp(), 
        uid: user.uid
      });
      setSaveSuccess(true); setSelectedTeacher(''); setSignatureData(null); setResetSigCounter(c => c+1);
      setTimeout(() => { setSaveSuccess(false); setSelectedSubject(''); }, 3000);
    } catch (e) { 
      alert("연결 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    }
    setIsSaving(false);
  };

  const confirmDeleteSignature = async (id) => {
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'individualSignatures', id));
      setSignatureData(null);
      setDeleteStep(0);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAdminSave = async () => {
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'global'), adminData);
      setAdminMessage({ type: 'success', text: '설정이 안전하게 저장되었습니다.' });
      setViewingExamKey(`${adminData.year}|${adminData.semester}|${adminData.examName}`);
      setTimeout(() => setAdminMessage({ type: '', text: '' }), 3000);
    } catch (e) {
      setAdminMessage({ type: 'error', text: '저장에 실패했습니다.' });
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

  // 💡 과거 기록 조회를 위한 파생 데이터 처리
  const allExamKeys = new Set(allSignatures.map(s => `${s.year}|${s.semester}|${s.examName}`));
  allExamKeys.add(`${globalSettings.year}|${globalSettings.semester}|${globalSettings.examName}`);
  const examOptions = Array.from(allExamKeys).sort((a,b) => b.localeCompare(a)); // 최신순 정렬

  const [vYear, vSem, vExam] = (viewingExamKey || `${globalSettings.year}|${globalSettings.semester}|${globalSettings.examName}`).split('|');
  const isViewingCurrent = viewingExamKey === `${globalSettings.year}|${globalSettings.semester}|${globalSettings.examName}`;
  
  // 조회 중인 시험의 서명 목록 필터링
  const viewingSignatures = allSignatures.filter(s => s.year === vYear && s.semester === vSem && s.examName === vExam);
  
  // 현황판에 표시할 과목과 교사 명단 설정 (과거 기록이면 제출된 내역 기반으로 병합)
  let subjectsToDisplay = Array.isArray(globalSettings.subjects) ? [...globalSettings.subjects] : [];
  if (!isViewingCurrent) {
    const pastSubjects = [...new Set(viewingSignatures.map(s => s.subject))];
    const historicalSubjects = pastSubjects.map(ps => {
      const existing = subjectsToDisplay.find(s => s.name === ps);
      const submittedTeachers = [...new Set(viewingSignatures.filter(s => s.subject === ps).map(s => s.teacherName))];
      return existing 
        ? { ...existing, teachers: [...new Set([...existing.teachers, ...submittedTeachers])] }
        : { name: ps, teachers: submittedTeachers };
    });
    subjectsToDisplay = historicalSubjects;
  }

  const handleExportCSV = () => {
    let csv = "\uFEFF과목명,교사명,제출상태,서명(클라우드기록)시간\n";
    subjectsToDisplay.forEach(subject => {
      const subjectSigs = viewingSignatures.filter(s => s.subject === subject.name);
      subject.teachers.forEach(teacher => {
        const sig = subjectSigs.find(s => s.teacherName === teacher);
        const status = sig ? "제출완료" : "미제출";
        const date = sig?.createdAt?.toDate ? formatDateTime(sig.createdAt.toDate().toISOString()) : "";
        csv += `${subject.name},${teacher},${status},${date}\n`;
      });
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `출제검토현황_${vYear}_${vSem}학기_${vExam}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const togglePrintStatus = async (subjectName, isCurrentlyPrinted) => {
    const docId = `${vYear}_${vSem}_${vExam}_${subjectName}`;
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'printStatuses', docId);
    try {
      if (isCurrentlyPrinted) await deleteDoc(docRef);
      else await setDoc(docRef, { year: vYear, semester: vSem, examName: vExam, subjectName: subjectName, printedAt: new Date().toISOString() });
    } catch (error) {
      console.error(error);
    }
  };

  // 교사용 뷰 전용 필터링
  const currentExamSignatures = allSignatures.filter(s => 
    s.year === String(globalSettings.year) && s.semester === String(globalSettings.semester) && s.examName === String(globalSettings.examName)
  );
  const subjectSignaturesForTeacherView = currentExamSignatures.filter(s => s.subject === selectedSubject);
  const existingSigForSelectedTeacher = subjectSignaturesForTeacherView.find(s => s.teacherName === selectedTeacher);
  const safeTeachers = subjectsToDisplay.find(s => s.name === selectedSubject)?.teachers || [];

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 selection:bg-blue-100 font-sans">
      
      {/* 💡 완벽한 표(Table) 형태로 디자인된 출력용 팝업 (스냅샷 백업 기능 포함) */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 md:p-8 print:static print:block print:bg-white print:p-0 animate-fade-in overflow-y-auto" onClick={() => setSelectedSubmission(null)}>
          <div className="bg-white p-10 md:p-14 rounded-none md:rounded-[2rem] max-w-4xl w-full shadow-2xl print:shadow-none print:max-w-none print:w-full print:p-0 my-auto" onClick={e => e.stopPropagation()}>
            
            <div className="print:text-black">
              <h2 className="text-3xl font-black text-center mb-8 tracking-[0.2em]">지필평가 출제 검토 확인서</h2>
              <p className="text-lg font-bold leading-relaxed mb-4 text-justify">
                본인은 {selectedSubmission.year}년 {selectedSubmission.semester}학기 {selectedSubmission.examName} {selectedSubmission.subject}과 시험문제를 출제함에 있어 아래 표와 같은 내용을 검토하였음을 확인합니다.
              </p>

              <table className="w-full border-collapse border-2 border-black mb-10 text-[15px] print:text-[14px]">
                <thead>
                  <tr>
                    <th className="border-2 border-black p-3 bg-gray-100 font-black text-center" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>검토 사항</th>
                    <th className="border-2 border-black p-3 bg-gray-100 font-black text-center w-28 whitespace-nowrap" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>확인여부<br/>(O, X)</th>
                  </tr>
                </thead>
                <tbody>
                  {/* 서명 당시 보존된 스냅샷 체크리스트를 렌더링합니다. (과거 서류 변형 방지) */}
                  {(selectedSubmission.checklistSnapshot || defaultChecklistData).map(item => (
                    <tr key={item.id}>
                      {item.type === 'category' ? (
                        <>
                          <td className="border border-black px-4 py-3 font-bold bg-gray-50 print:bg-gray-50" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>{item.text}</td>
                          <td className="border border-black px-4 py-3 bg-gray-50 print:bg-gray-50" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}></td>
                        </>
                      ) : (
                        <>
                          <td className={`border border-black px-4 py-2 leading-snug ${item.type === 'item2' ? 'pl-8' : 'pl-4'}`}>{item.text}</td>
                          <td className="border border-black p-2 text-center font-black text-xl">{item.status}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="text-center mt-12 print:mt-16">
                <p className="text-lg font-bold mb-6">위 항목을 모두 확인하고 이상 없음을 확인합니다.</p>
                <p className="text-xl font-bold tracking-widest mb-10">{globalSettings.documentDate}</p>
                
                {/* 💡 서명이 이름 바로 옆 '(서명/인)' 글자 위에 자연스럽게 겹치도록 수정 */}
                <div className="flex justify-end items-center text-xl font-bold pr-4">
                  <span className="mr-8">확인 직위: 교사</span>
                  <span className="mr-2">성명: {selectedSubmission.teacherName}</span>
                  <div className="relative inline-flex items-center justify-center w-28 h-12 ml-2">
                    <span className="z-0 text-gray-800">(서명/인)</span>
                    <img 
                      src={selectedSubmission.signatureData} 
                      alt="서명" 
                      className="absolute z-10 h-16 w-[140%] max-w-none object-contain mix-blend-multiply drop-shadow-sm pointer-events-none" 
                      style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-16 pt-8 border-t border-gray-200 print:hidden">
              {/* PDF 백업을 유도하는 명확한 문구 사용 */}
              <button onClick={() => window.print()} className="flex-1 py-4 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 text-lg shadow-lg active:scale-95">
                <Printer size={22}/> 인쇄 및 PDF로 백업 저장
              </button>
              <button onClick={() => setSelectedSubmission(null)} className="flex-1 py-4 bg-gray-900 text-white font-black rounded-xl hover:bg-black transition-all flex items-center justify-center gap-2 text-lg active:scale-95">
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

          {/* 1. 교사 서명 화면 */}
          {viewMode === 'teacher' && (
            <div className="w-full max-w-md bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden border border-white relative mt-4">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-8 text-center relative overflow-hidden">
                <h2 className="text-2xl font-black mb-2 relative z-10">출제 검토 확인서</h2>
                <p className="text-blue-100 text-sm font-medium opacity-90 relative z-10">
                  {String(globalSettings.year)}년 {String(globalSettings.semester)}학기 {String(globalSettings.examName)}
                </p>
              </div>
              
              {saveSuccess ? (
                <div className="p-20 text-center animate-fade-in">
                  <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <Check className="text-green-600" size={48} strokeWidth={3}/>
                  </div>
                  <h3 className="text-2xl font-black text-gray-800">제출 완료!</h3>
                  <p className="text-gray-500 mt-3 text-sm font-medium">감사합니다. 문서가 클라우드에 영구 보존되었습니다.</p>
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
                        {(globalSettings.checklist || defaultChecklistData).map(item => (
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
                        {Array.isArray(globalSettings.subjects) && globalSettings.subjects.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                      </select>
                      <div className="absolute right-4 bottom-4 pointer-events-none opacity-30"><Search size={18}/></div>
                    </div>

                    {selectedSubject && safeTeachers.length > 0 && (
                      <div className="animate-fade-in relative group">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 mb-1">Teacher</label>
                        <select value={selectedTeacher} onChange={e=>setSelectedTeacher(e.target.value)} className="w-full p-4 bg-blue-50/50 border-2 border-blue-100 rounded-2xl text-base font-bold text-blue-800 focus:border-blue-500 focus:bg-white transition-all appearance-none outline-none shadow-sm" required>
                          <option value="">성함을 선택하세요</option>
                          {/* 💡 재서명을 위해 이제 제출한 선생님도 명단에 보입니다. */}
                          {safeTeachers.map(t=><option key={t} value={t}>{t}</option>)}
                        </select>
                        <div className="absolute right-4 bottom-4 pointer-events-none opacity-30"><Users size={18}/></div>
                      </div>
                    )}

                    {/* 💡 서명을 이미 한 교사일 경우, 재서명(삭제) 옵션을 띄웁니다. */}
                    {selectedTeacher && existingSigForSelectedTeacher ? (
                      <div className="animate-fade-in p-5 bg-emerald-50 border-2 border-emerald-200 rounded-2xl text-center shadow-sm">
                        <CheckCircle className="mx-auto text-emerald-500 mb-2" size={36}/>
                        <p className="font-black text-emerald-800 mb-1 text-lg">제출 완료</p>
                        <p className="text-xs text-gray-500 mb-5 font-medium">제출일시: {formatDateTime(existingSigForSelectedTeacher.createdAt?.toDate?.()?.toISOString())}</p>
                        
                        <button
                          type="button"
                          onClick={() => {
                            if (deleteStep === 0) setDeleteStep(1);
                            else confirmDeleteSignature(existingSigForSelectedTeacher.id);
                          }}
                          className={`w-full py-3.5 font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 ${
                            deleteStep === 0 
                              ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50' 
                              : 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
                          }`}
                        >
                          <Trash2 size={16}/>
                          {deleteStep === 0 ? '잘못 제출했습니다 (삭제 후 재서명)' : '정말 삭제하시겠습니까? (클릭 시 즉시 삭제)'}
                        </button>
                      </div>
                    ) : selectedTeacher && (
                      <div className="animate-fade-in space-y-3 pt-2">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Signature</label>
                        <SignaturePad onSave={setSignatureData} resetTrigger={resetSigCounter} />
                        <button type="submit" disabled={isSaving || !signatureData} className="w-full py-5 bg-gray-900 text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-gray-200 hover:bg-black transition-all active:scale-95 disabled:bg-gray-300 flex items-center justify-center gap-2 mt-4">
                          {isSaving ? '클라우드에 안전하게 보존 중...' : <><Save size={20}/> 확인 및 서명 제출</>}
                        </button>
                      </div>
                    )}
                  </div>
                </form>
              )}
            </div>
          )}

          {/* 2. 제출 현황 및 과거 기록 조회 화면 */}
          {viewMode === 'status' && isUnlocked && (
            <div className="w-full max-w-4xl bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white p-8 md:p-10 animate-fade-in mt-4 print:shadow-none print:p-0 print:mt-0">
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-gray-100 pb-6 print:border-b-2 print:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 p-3 rounded-2xl print:hidden"><BarChart3 className="text-emerald-600" size={24}/></div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-800">과목별 검토 제출 현황</h2>
                    <p className="text-gray-500 text-sm font-medium">진행 현황을 모니터링하고 문서를 인쇄합니다.</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 print:hidden">
                  {/* 💡 과거 기록 영구 조회를 위한 드롭다운 추가 */}
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 p-1 rounded-xl">
                    <History size={16} className="text-gray-400 ml-2"/>
                    <select 
                      value={viewingExamKey} 
                      onChange={(e) => setViewingExamKey(e.target.value)}
                      className="bg-transparent p-2 text-sm font-bold text-gray-700 outline-none pr-4"
                    >
                      {examOptions.map(opt => {
                        const [y, s, e] = opt.split('|');
                        return <option key={opt} value={opt}>{y}년 {s}학기 {e}</option>
                      })}
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={handleExportCSV} className="bg-blue-50 text-blue-700 px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold hover:bg-blue-100 transition-colors border border-blue-200">
                      <Download size={16} /> 엑셀
                    </button>
                    <button onClick={() => window.print()} className="bg-gray-800 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold hover:bg-black transition-colors shadow-md">
                      <Printer size={16} /> 인쇄
                    </button>
                  </div>
                </div>
              </div>

              {/* 현재 조회 중인 시험 정보 배너 */}
              <div className="mb-6 print:mb-8 text-center text-lg font-black text-gray-800 bg-gray-50 py-3 rounded-xl print:bg-transparent print:p-0">
                {vYear}년 {vSem}학기 {vExam}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-2">
                {subjectsToDisplay.map(subject => {
                  const subjectSignatures = viewingSignatures.filter(s => s.subject === subject.name);
                  const submittedNames = subjectSignatures.map(s => s.teacherName);
                  const totalCount = subject.teachers.length;
                  const submittedCount = subject.teachers.filter(t => submittedNames.includes(t)).length;
                  const isComplete = totalCount > 0 && submittedCount === totalCount;
                  
                  const printRecord = printStatuses.find(p => 
                    p.year === vYear && p.semester === vSem && p.examName === vExam && p.subjectName === subject.name
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
                                    <FileText size={14} className="print:hidden"/> 백업 서류 확인
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
              {subjectsToDisplay.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-3xl mt-6">
                  <p className="text-gray-500 font-bold">이 시험 기간에 기록된 데이터가 없습니다.</p>
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
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="md:col-span-1">
                    <label className="block text-[10px] font-black text-gray-500 mb-2">연도</label>
                    <input type="text" value={adminData.year} onChange={e=>setAdminData({...adminData, year: e.target.value})} className="w-full p-2.5 bg-gray-50 border-2 border-gray-100 rounded-xl text-center text-sm font-bold focus:border-purple-500 outline-none"/>
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-[10px] font-black text-gray-500 mb-2">학기</label>
                    <input type="text" value={adminData.semester} onChange={e=>setAdminData({...adminData, semester: e.target.value})} className="w-full p-2.5 bg-gray-50 border-2 border-gray-100 rounded-xl text-center text-sm font-bold focus:border-purple-500 outline-none"/>
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-[10px] font-black text-gray-500 mb-2">고사명 (예: 중간고사)</label>
                    <input type="text" value={adminData.examName} onChange={e=>setAdminData({...adminData, examName: e.target.value})} className="w-full p-2.5 bg-gray-50 border-2 border-gray-100 rounded-xl text-center text-sm font-bold focus:border-purple-500 outline-none"/>
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-[10px] font-black text-gray-500 mb-2">출력용 날짜</label>
                    <input type="text" value={adminData.documentDate} onChange={e=>setAdminData({...adminData, documentDate: e.target.value})} className="w-full p-2.5 bg-gray-50 border-2 border-gray-100 rounded-xl text-center text-sm font-bold focus:border-purple-500 outline-none"/>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-[10px] font-black text-purple-600 mb-2">관리자 비밀번호</label>
                    <input type="text" value={adminData.adminPassword || '1234'} onChange={e=>setAdminData({...adminData, adminPassword: e.target.value})} className="w-full p-2.5 bg-purple-50 border-2 border-purple-100 text-purple-700 rounded-xl text-center text-sm font-black focus:border-purple-500 outline-none"/>
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
                      <select value={newChecklistType} onChange={e=>setNewChecklistType(e.target.value)} className="p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-purple-500 font-bold text-gray-700 shrink-0">
                        <option value="category">대분류 (제목)</option>
                        <option value="item1">중분류 (가, 나...)</option>
                        <option value="item2">소분류 (1), 2)...)</option>
                      </select>
                      <input type="text" value={newChecklistText} onChange={e=>setNewChecklistText(e.target.value)} placeholder="검토 항목 내용 입력" className="flex-1 p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-purple-500"/>
                      <button type="button" onClick={addChecklistItem} className="bg-gray-800 text-white px-4 rounded-xl font-bold hover:bg-black transition-all shadow-md active:scale-95 whitespace-nowrap shrink-0">
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