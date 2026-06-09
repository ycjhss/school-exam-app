import React, { useState, useRef, useEffect } from 'react';
import { 
  Save, CheckCircle, Trash2, Users, Check, AlertCircle, FileText, 
  Edit2, Search, Settings, Plus, X, BarChart3, Clock, List,
  Printer, Download, Lock, Unlock, Image as ImageIcon, History,
  CalendarDays, Edit
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

const printStyles = `
  @page {
    size: A4 portrait;
    margin: 12mm;
  }

  @media print {
    html,
    body,
    #root {
      width: auto !important;
      min-height: auto !important;
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
      overflow: visible !important;
    }

    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      text-shadow: none !important;
    }

    .print-document-modal {
      position: static !important;
      inset: auto !important;
      display: block !important;
      width: 100% !important;
      min-height: auto !important;
      height: auto !important;
      max-height: none !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow: visible !important;
      background: #ffffff !important;
    }

    .print-document-sheet {
      width: 100% !important;
      max-width: none !important;
      min-height: auto !important;
      height: auto !important;
      margin: 0 !important;
      padding: 0 !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      overflow: visible !important;
    }

    .print-document-content {
      width: 100% !important;
      max-width: none !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow: visible !important;
      color: #000000 !important;
    }

    .print-document-content h2 {
      margin: 0 0 18px 0 !important;
      font-size: 20pt !important;
      line-height: 1.2 !important;
      letter-spacing: 0.12em !important;
    }

    .print-document-content p {
      font-size: 11pt !important;
      line-height: 1.5 !important;
    }

    .print-document-content table {
      width: 100% !important;
      table-layout: fixed !important;
      border-collapse: collapse !important;
      margin-bottom: 22px !important;
      page-break-inside: auto !important;
    }

    .print-document-content thead {
      display: table-header-group !important;
    }

    .print-document-content tr {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    .print-document-content th {
      padding: 6px 8px !important;
      font-size: 10.5pt !important;
      line-height: 1.25 !important;
      background: #f3f4f6 !important;
    }

    .print-document-content td {
      padding: 5px 8px !important;
      font-size: 10pt !important;
      line-height: 1.35 !important;
    }

    .print-document-content td:last-child,
    .print-document-content th:last-child {
      width: 22mm !important;
    }

    .print-signature-area {
      margin-top: 24px !important;
    }

    .print-signature-area p {
      margin-bottom: 12px !important;
    }

    .print-signature-list {
      gap: 10px !important;
      padding-right: 0 !important;
      font-size: 12pt !important;
    }

    .print-signature-row {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    .print-status-page {
      width: 100% !important;
      max-width: none !important;
      margin: 0 !important;
      padding: 0 !important;
      border: 0 !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      background: #ffffff !important;
      overflow: visible !important;
    }

    .print-status-page table {
      page-break-inside: auto !important;
    }

    .print-status-page tr,
    .print-status-page .print\\:break-inside-avoid {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
  }
`;

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
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const yy = String(date.getFullYear()).slice(2);
    const mm = date.getMonth() + 1;
    const dd = date.getDate();
    const day = days[date.getDay()];
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${yy}. ${mm}. ${dd}. (${day}) ${hh}:${min}`;
  } catch (e) {
    return '';
  }
};

const getDisplayDate = (sig) => {
  if (!sig || !sig.createdAt) return '';
  try {
    if (typeof sig.createdAt.toDate === 'function') {
      return formatDateTime(sig.createdAt.toDate().toISOString());
    }
    if (typeof sig.createdAt === 'string') {
      return formatDateTime(sig.createdAt);
    }
    if (sig.createdAt instanceof Date) {
      return formatDateTime(sig.createdAt.toISOString());
    }
  } catch(e) {
    return '';
  }
  return '';
};

const formatExamOption = (opt) => {
  const [y, s, e] = opt.split('|');
  const displayY = y === 'undefined' ? '?' : y;
  const displayS = s === 'undefined' ? '?' : s;
  const displayE = e === 'undefined' ? '(구버전 기록)' : e;
  return `${displayY}년 ${displayS}학기 ${displayE}`;
};

const getScopeId = (vYear, vSem, vExam, item) => {
  return `${vYear}_${vSem}_${vExam}_${item.date}_${item.grade}_${item.period}_${item.subject}`.replace(/\s/g, '');
};

const SignaturePad = ({ onSave, resetTrigger }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.parentElement) return;
    const rect = canvas.parentElement.getBoundingClientRect();
    
    if (canvas.width !== rect.width) canvas.width = rect.width;
    if (canvas.height !== 160) canvas.height = 160;

    const ctx = canvas.getContext('2d');
    if (!ctx) return; 
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';
  };

  useEffect(() => {
    initCanvas();
    window.addEventListener('resize', initCanvas);
    return () => window.removeEventListener('resize', initCanvas);
  }, []);

  useEffect(() => { if (resetTrigger) clearCanvas(); }, [resetTrigger]);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches && e.touches.length > 0 ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDrawing = (e) => {
    e.preventDefault(); 
    setIsDrawing(true);
    const coords = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath(); 
      ctx.moveTo(coords.x, coords.y);
    }
  };

  const draw = (e) => {
    e.preventDefault(); 
    if (!isDrawing) return;
    const coords = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.lineTo(coords.x, coords.y); 
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (isDrawing) { 
      setIsDrawing(false); 
      if (canvasRef.current) {
        onSave(canvasRef.current.toDataURL()); 
      }
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    onSave(null);
  };

  return (
    <div className="w-full animate-fade-in">
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
  const [statusTab, setStatusTab] = useState('signature');
  
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const [selectedSubmission, setSelectedSubmission] = useState(null); 
  const [viewingExamKey, setViewingExamKey] = useState(''); 

  const defaultGlobalSettings = {
    year: '2026', semester: '1', examName: '1차 정기시험', documentDate: '2026. 4. 28.',
    adminPassword: '1234', 
    subjects: [
      { name: '공통국어1', teachers: ['홍길동', '이순신'] },
      { name: '한국사1', teachers: ['강감찬'] }
    ],
    checklist: defaultChecklistData,
    examSchedule: []
  };

  const [globalSettings, setGlobalSettings] = useState(defaultGlobalSettings);
  
  // Teacher Signature State
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [signatureData, setSignatureData] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [deleteStep, setDeleteStep] = useState(0); 
  const [resetSigCounter, setResetSigCounter] = useState(0);

  // Scope Input State
  const [examScopes, setExamScopes] = useState([]);
  const [selectedScheduleItem, setSelectedScheduleItem] = useState(null);
  const [scopeInputText, setScopeInputText] = useState('');
  const [scopeInputTeacher, setScopeInputTeacher] = useState('');

  // Admin State
  const [adminData, setAdminData] = useState(defaultGlobalSettings);
  const [newSubject, setNewSubject] = useState('');
  const [newTeachers, setNewTeachers] = useState({}); 
  const [adminMessage, setAdminMessage] = useState({ type: '', text: '' });
  const [bulkInput, setBulkInput] = useState(''); 
  const [scheduleBulkInput, setScheduleBulkInput] = useState('');
  const [allSignatures, setAllSignatures] = useState([]); 
  const [printStatuses, setPrintStatuses] = useState([]); 
  const [newChecklistType, setNewChecklistType] = useState('item1');
  const [newChecklistText, setNewChecklistText] = useState('');
  const [deleteExamKey, setDeleteExamKey] = useState(null);

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
            setViewingExamKey(`${data.year || '2026'}|${data.semester || '1'}|${data.examName || '1차 정기시험'}`); 
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
      }
    );
    const unsubPrints = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'printStatuses'), 
      (snap) => {
        const records = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPrintStatuses(records);
      }
    );
    const unsubScopes = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'examScopes'), 
      (snap) => {
        const scopes = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setExamScopes(scopes);
      }
    );
    return () => { unsubSigs(); unsubPrints(); unsubScopes(); };
  }, [user]);

  const handleUnlockAdmin = (e) => {
    e.preventDefault();
    const currentPassword = globalSettings.adminPassword || '1234';
    if (pinInput === currentPassword) {
      setIsAdminUnlocked(true);
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
    setSubmitError('');
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'individualSignatures'), {
        year: String(globalSettings.year), 
        semester: String(globalSettings.semester), 
        examName: String(globalSettings.examName),
        subject: selectedSubject, 
        teacherName: selectedTeacher, 
        signatureData,
        checklistSnapshot: globalSettings.checklist || defaultChecklistData, 
        createdAt: serverTimestamp(), 
        uid: user.uid
      });
      setSaveSuccess(true); setSelectedTeacher(''); setSignatureData(null); setResetSigCounter(c => c+1);
      setTimeout(() => { setSaveSuccess(false); setSelectedSubject(''); }, 3000);
    } catch (e) { 
      setSubmitError("데이터베이스 연결 오류입니다. 관리자에게 문의하세요.");
      setTimeout(() => setSubmitError(''), 4000);
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

  const handleScopeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedScheduleItem || !scopeInputTeacher.trim()) {
      alert("성함을 입력해주세요.");
      return;
    }
    setIsSaving(true);
    try {
      const vYear = String(globalSettings.year);
      const vSem = String(globalSettings.semester);
      const vExam = String(globalSettings.examName);
      const docId = getScopeId(vYear, vSem, vExam, selectedScheduleItem);
      
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'examScopes', docId), {
        year: vYear, semester: vSem, examName: vExam,
        date: selectedScheduleItem.date, grade: selectedScheduleItem.grade,
        period: selectedScheduleItem.period, subject: selectedScheduleItem.subject,
        scopeText: scopeInputText, teacherName: scopeInputTeacher.trim(),
        updatedAt: serverTimestamp()
      });
      setSelectedScheduleItem(null); setScopeInputText(''); setScopeInputTeacher('');
    } catch (err) {
      console.error(err);
      alert("저장 중 오류가 발생했습니다.");
    }
    setIsSaving(false);
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

  const executeDeleteExamRecords = async (examKey) => {
    const [dYear, dSem, dExam] = examKey.split('|');
    try {
      const sigsToDelete = allSignatures.filter(s => String(s.year) === dYear && String(s.semester) === dSem && String(s.examName) === dExam);
      for (const sig of sigsToDelete) {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'individualSignatures', sig.id));
      }
      const printsToDelete = printStatuses.filter(p => String(p.year) === dYear && String(p.semester) === dSem && String(p.examName) === dExam);
      for (const p of printsToDelete) {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'printStatuses', p.id));
      }
      const scopesToDelete = examScopes.filter(s => String(s.year) === dYear && String(s.semester) === dSem && String(s.examName) === dExam);
      for (const sc of scopesToDelete) {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'examScopes', sc.id));
      }
      setDeleteExamKey(null);
      setAdminMessage({ type: 'success', text: `과거 기록이 영구 삭제되었습니다.` });
      setTimeout(() => setAdminMessage({ type: '', text: '' }), 4000);
    } catch (e) {
      console.error(e);
      setAdminMessage({ type: 'error', text: '삭제 중 오류가 발생했습니다.' });
      setTimeout(() => setAdminMessage({ type: '', text: '' }), 4000);
    }
  };

  const handleBulkPaste = () => {
    if(!bulkInput.trim()) return;
    const lines = bulkInput.split('\n');
    const newSubjectsMap = {};
    (adminData.subjects || []).forEach(s => { newSubjectsMap[s.name] = new Set(s.teachers || []); });
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

  const handleScheduleBulkPaste = () => {
    if(!scheduleBulkInput.trim()) return;
    const lines = scheduleBulkInput.split('\n');
    const newSchedule = lines.map((line, i) => {
      const parts = line.split('\t').map(p => p.trim()).filter(Boolean);
      if (parts.length >= 4) {
        return { id: Date.now() + i, date: parts[0], grade: parts[1], period: parts[2], subject: parts[3] };
      }
      return null;
    }).filter(Boolean);
    
    setAdminData(prev => ({ 
      ...prev, 
      examSchedule: [...(prev.examSchedule || []), ...newSchedule] 
    }));
    setScheduleBulkInput('');
    setAdminMessage({ type: 'success', text: '시간표 명단이 추가되었습니다. 꼭 [전체 설정 저장하기]를 눌러주세요.' });
    setTimeout(() => setAdminMessage({ type: '', text: '' }), 4000);
  };

  const removeScheduleItem = (id) => {
    setAdminData(prev => ({ ...prev, examSchedule: (prev.examSchedule || []).filter(item => item.id !== id) }));
  };

  const allExamKeys = new Set([...allSignatures, ...examScopes].map(s => `${s.year}|${s.semester}|${s.examName}`));
  allExamKeys.add(`${globalSettings.year || '2026'}|${globalSettings.semester || '1'}|${globalSettings.examName || '1차 정기시험'}`);
  const examOptions = Array.from(allExamKeys).sort((a,b) => b.localeCompare(a)); 

  const [vYear, vSem, vExam] = (viewingExamKey || `${globalSettings.year || '2026'}|${globalSettings.semester || '1'}|${globalSettings.examName || '1차 정기시험'}`).split('|');
  const isViewingCurrent = viewingExamKey === `${globalSettings.year}|${globalSettings.semester}|${globalSettings.examName}`;
  
  const viewingSignatures = allSignatures.filter(s => String(s.year) === vYear && String(s.semester) === vSem && String(s.examName) === vExam);
  const viewingScopes = examScopes.filter(s => String(s.year) === vYear && String(s.semester) === vSem && String(s.examName) === vExam);
  
  let subjectsToDisplay = Array.isArray(globalSettings.subjects) ? [...globalSettings.subjects] : [];
  if (!isViewingCurrent) {
    const pastSubjects = [...new Set(viewingSignatures.map(s => s.subject))];
    const historicalSubjects = pastSubjects.map(ps => {
      const existing = subjectsToDisplay.find(s => s.name === ps);
      const submittedTeachers = [...new Set(viewingSignatures.filter(s => s.subject === ps).map(s => s.teacherName))];
      return existing 
        ? { ...existing, teachers: [...new Set([...(existing.teachers || []), ...submittedTeachers])] }
        : { name: ps, teachers: submittedTeachers };
    });
    subjectsToDisplay = historicalSubjects;
  }

  const scheduleToDisplay = globalSettings.examSchedule || [];

  const handleExportCSV = () => {
    let csv = "\uFEFF과목명,교사명,제출상태,서명(클라우드기록)시간\n";
    subjectsToDisplay.forEach(subject => {
      const subjectSigs = viewingSignatures.filter(s => s.subject === subject.name);
      (subject.teachers || []).forEach(teacher => {
        const sig = subjectSigs.find(s => s.teacherName === teacher);
        const status = sig ? "제출완료" : "미제출";
        const date = getDisplayDate(sig);
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

  const handleExportScopeCSV = () => {
    const escapeCSV = (value) => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      return `"${str.replace(/"/g, '""')}"`;
    };

    let csv = "\uFEFF일자,학년,교시,과목,시험 범위,작성자,최종수정일\n";

    scheduleToDisplay.forEach((item) => {
      const scopeId = getScopeId(vYear, vSem, vExam, item);
      const scopeDoc = viewingScopes.find(s => s.id === scopeId);

      const row = [
        item.date, item.grade, item.period, item.subject,
        scopeDoc ? (scopeDoc.scopeText || '') : '',
        scopeDoc ? (scopeDoc.teacherName || '') : '',
        scopeDoc ? getDisplayDate(scopeDoc) : ''
      ];

      csv += row.map(escapeCSV).join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `시험범위표_${vYear}_${vSem}학기_${vExam}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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

  const addSubject = () => {
    if(!newSubject.trim()) return;
    setAdminData(prev => ({ ...prev, subjects: [...(prev.subjects || []), { name: newSubject.trim(), teachers: [] }] }));
    setNewSubject('');
  };

  const removeSubject = (subjectName) => {
    setAdminData(prev => ({ ...prev, subjects: (prev.subjects || []).filter(s => s.name !== subjectName) }));
  };

  const addTeacherToSubject = (subjectName) => {
    const teacherName = newTeachers[subjectName]?.trim();
    if(!teacherName) return;
    setAdminData(prev => ({ ...prev, subjects: (prev.subjects || []).map(s => s.name === subjectName ? { ...s, teachers: [...(s.teachers || []), teacherName] } : s) }));
    setNewTeachers(prev => ({ ...prev, [subjectName]: '' }));
  };

  const removeTeacherFromSubject = (subjectName, teacherName) => {
    setAdminData(prev => ({ ...prev, subjects: (prev.subjects || []).map(s => s.name === subjectName ? { ...s, teachers: (s.teachers || []).filter(t => t !== teacherName) } : s) }));
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

  const renderScheduleTable = (isPrintView = false) => {
    if (scheduleToDisplay.length === 0) {
      return <div className="p-8 text-center text-gray-500 font-bold bg-gray-50 rounded-2xl">등록된 시험 시간표가 없습니다. 관리자 설정에서 엑셀을 붙여넣어주세요.</div>;
    }

    const dateSpans = {};
    const gradeSpans = {};
    
    scheduleToDisplay.forEach(item => {
      dateSpans[item.date] = (dateSpans[item.date] || 0) + 1;
      const gradeKey = `${item.date}_${item.grade}`;
      gradeSpans[gradeKey] = (gradeSpans[gradeKey] || 0) + 1;
    });

    const renderedDates = new Set();
    const renderedGrades = new Set();

    return (
      <div className={`w-full overflow-x-auto ${isPrintView ? 'print:overflow-visible' : 'bg-white rounded-2xl shadow-sm border border-gray-200'}`}>
        <table className={`w-full border-collapse border-2 border-black text-center text-[15px] ${isPrintView ? 'print:text-[13px] print:w-full' : ''}`}>
          <thead>
            <tr>
              <th className="border-2 border-black p-2 bg-gray-100 font-black w-24">일자</th>
              <th className="border-2 border-black p-2 bg-gray-100 font-black w-16">학년</th>
              <th className="border-2 border-black p-2 bg-gray-100 font-black w-16">교시</th>
              <th className="border-2 border-black p-2 bg-gray-100 font-black w-40">과목</th>
              <th className="border-2 border-black p-2 bg-gray-100 font-black">시험 범위</th>
              {!isPrintView && <th className="border-2 border-black p-2 bg-gray-100 font-black w-24">관리</th>}
            </tr>
          </thead>
          <tbody>
            {scheduleToDisplay.map((item, idx) => {
              const scopeId = getScopeId(vYear, vSem, vExam, item);
              const scopeDoc = viewingScopes.find(s => s.id === scopeId);
              const gradeKey = `${item.date}_${item.grade}`;

              const showDate = !renderedDates.has(item.date);
              if (showDate) renderedDates.add(item.date);

              const showGrade = !renderedGrades.has(gradeKey);
              if (showGrade) renderedGrades.add(gradeKey);

              return (
                <tr key={item.id || idx}>
                  {showDate && <td rowSpan={dateSpans[item.date]} className="border border-black p-2 align-middle whitespace-pre-wrap">{item.date}</td>}
                  {showGrade && <td rowSpan={gradeSpans[gradeKey]} className="border border-black p-2 align-middle font-bold">{item.grade}</td>}
                  <td className="border border-black p-2">{item.period}</td>
                  <td className="border border-black p-2 font-bold">{item.subject}</td>
                  <td className="border border-black p-3 text-left whitespace-pre-wrap min-w-[200px] leading-relaxed">
                    {
                      scopeDoc
                        ? scopeDoc.scopeText
                        : (isPrintView ? '' : <span className="text-gray-300 italic">미입력</span>)
                    }
                    {!isPrintView && scopeDoc && (
                      <div className="text-[10px] text-gray-400 mt-2 font-medium text-right">
                        마지막 수정: {scopeDoc.teacherName} ({getDisplayDate(scopeDoc)})
                      </div>
                    )}
                  </td>
                  {!isPrintView && (
                    <td className="border border-black p-2 align-middle">
                      <button 
                        onClick={() => {
                          setSelectedScheduleItem(item);
                          setScopeInputText(scopeDoc?.scopeText || '');
                          setScopeInputTeacher(''); 
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all w-full flex items-center justify-center gap-1 ${scopeDoc ? 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100' : 'bg-gray-800 text-white hover:bg-black'}`}
                      >
                        <Edit size={12}/> {scopeDoc ? '수정' : '입력'}
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const safeSubjects = Array.isArray(globalSettings.subjects) ? globalSettings.subjects : [];
  const safeTeachers = safeSubjects.find(s => s.name === selectedSubject)?.teachers || [];
  const currentExamSignatures = allSignatures.filter(s => 
    String(s.year) === String(globalSettings.year) && 
    String(s.semester) === String(globalSettings.semester) && 
    String(s.examName) === String(globalSettings.examName)
  );

  const subjectSignaturesForTeacherView = currentExamSignatures.filter(s => s.subject === selectedSubject);
  const existingSigForSelectedTeacher = subjectSignaturesForTeacherView.find(s => s.teacherName === selectedTeacher);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 selection:bg-blue-100 font-sans">
      <style>{printStyles}</style>
      
      {/* 💡 1. 서명 및 공문서 통합/개별 확인용 팝업 (단 1개만 렌더링) */}
      {selectedSubmission && selectedSubmission.length > 0 && (() => {
        const baseSub = selectedSubmission[0]; 
        
        return (
          <div className="print-document-modal fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 md:p-8 print:static print:block print:bg-white print:p-0 animate-fade-in overflow-y-auto" onClick={() => setSelectedSubmission(null)}>
            <div className="print-document-sheet bg-white p-10 md:p-14 rounded-none md:rounded-[2rem] max-w-4xl w-full shadow-2xl print:shadow-none print:max-w-none print:w-full print:p-0 my-auto" onClick={e => e.stopPropagation()}>
              
              <div className="print-document-content print:text-black">
                <h2 className="text-3xl font-black text-center mb-8 tracking-[0.2em]">지필평가 출제 검토 확인서</h2>
                <p className="text-lg font-bold leading-relaxed mb-4 text-justify">
                  본인은 {baseSub.year === 'undefined' ? '?' : baseSub.year}년 {baseSub.semester === 'undefined' ? '?' : baseSub.semester}학기 {baseSub.examName === 'undefined' ? '' : baseSub.examName} {baseSub.subject}과 시험문제를 출제함에 있어 아래 표와 같은 내용을 검토하였음을 확인합니다.
                </p>

                <table className="w-full border-collapse border-2 border-black mb-10 text-[15px] print:text-[14px]">
                  <thead>
                    <tr>
                      <th className="border-2 border-black p-3 bg-gray-100 font-black text-center" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>검토 사항</th>
                      <th className="border-2 border-black p-3 bg-gray-100 font-black text-center w-28 whitespace-nowrap" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>확인여부<br/>(O, X)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(baseSub.checklistSnapshot || defaultChecklistData).map(item => (
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

                <div className="print-signature-area text-center mt-12 print:mt-16">
                  <p className="text-lg font-bold mb-6">위 항목을 모두 확인하고 이상 없음을 확인합니다.</p>
                  <p className="text-xl font-bold tracking-widest mb-10">{globalSettings.documentDate}</p>
                  
                  <div className="print-signature-list flex flex-col items-end text-xl font-bold pr-4 gap-y-6 mt-4">
                    {selectedSubmission.map((sub, idx) => (
                      <div key={idx} className="print-signature-row flex items-center">
                        <span className={`mr-8 ${idx === 0 ? '' : 'invisible'}`}>확인 직위: 교사</span>
                        <span className="mr-2 w-32 text-right">성명: {sub.teacherName}</span>
                        <div className="relative inline-flex items-center justify-center w-28 h-12 ml-2">
                          <span className="z-0 text-gray-400 font-normal">(서명/인)</span>
                          <img 
                            src={sub.signatureData} 
                            alt="서명" 
                            className="absolute z-10 h-16 w-[140%] max-w-none object-contain mix-blend-multiply drop-shadow-sm pointer-events-none" 
                            style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              </div>

              <div className="flex gap-4 mt-16 pt-8 border-t border-gray-200 print:hidden">
                <button onClick={() => window.print()} className="flex-1 py-4 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 text-lg shadow-lg active:scale-95">
                  <Printer size={22}/> 인쇄 및 PDF로 백업 저장
                </button>
                <button onClick={() => setSelectedSubmission(null)} className="flex-1 py-4 bg-gray-900 text-white font-black rounded-xl hover:bg-black transition-all flex items-center justify-center gap-2 text-lg active:scale-95">
                  <X size={22}/> 닫기
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 💡 2. 시험 범위 입력 모달 (단 1개만 렌더링) */}
      {selectedScheduleItem && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in print:hidden" onClick={() => setSelectedScheduleItem(null)}>
          <div className="bg-white p-8 rounded-[2rem] max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
                <Edit2 className="text-blue-500" size={24}/> 시험 범위 입력
              </h2>
              <button onClick={() => setSelectedScheduleItem(null)} className="text-gray-400 hover:text-red-500"><X size={24}/></button>
            </div>
            
            <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-sm font-bold text-blue-900">{selectedScheduleItem.date} {selectedScheduleItem.grade}학년 {selectedScheduleItem.period}교시</p>
              <p className="text-lg font-black text-blue-700">{selectedScheduleItem.subject}</p>
            </div>

            <form onSubmit={handleScopeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-500 mb-2">시험 범위 내용</label>
                <textarea 
                  value={scopeInputText} 
                  onChange={e => setScopeInputText(e.target.value)} 
                  className="w-full h-32 p-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 resize-none"
                  placeholder="예: 교과서 p.12 ~ p.56, 학습지 1~3회차"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-500 mb-2">작성자(수정자) 성함</label>
                <input 
                  type="text" 
                  value={scopeInputTeacher} 
                  onChange={e => setScopeInputTeacher(e.target.value)} 
                  className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm font-bold outline-none focus:border-blue-500"
                  placeholder="홍길동"
                  required
                />
              </div>
              <button type="submit" disabled={isSaving} className="w-full py-4 mt-2 bg-gray-900 text-white rounded-xl font-black shadow-md hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-2">
                {isSaving ? '저장 중...' : <><Save size={18}/> 시험 범위 저장하기</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 💡 3. 전체 메인 레이아웃 (팝업이 열려있으면 인쇄 시 숨김) */}
      <div className={`${selectedSubmission || selectedScheduleItem ? 'print:hidden' : ''} flex flex-col flex-1`}>
        <header className="bg-white/90 backdrop-blur-md sticky top-0 z-10 border-b border-gray-200 px-3 sm:px-6 py-3 flex justify-between items-center shadow-sm print:hidden">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-blue-600 p-1.5 sm:p-2 rounded-xl shadow-lg shadow-blue-200">
              <FileText className="text-white w-4 h-4 sm:w-5 sm:h-5"/>
            </div>
            <h1 className="text-base sm:text-xl font-black text-gray-800 tracking-tight whitespace-nowrap">백송고 정기고사</h1>
          </div>
          <div className="flex bg-gray-200/50 p-1 rounded-xl sm:rounded-2xl border border-gray-200 overflow-x-auto custom-scrollbar no-scrollbar">
            <button onClick={() => setViewMode('teacher')} className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black transition-all duration-200 whitespace-nowrap flex items-center gap-1 ${viewMode==='teacher'?'bg-white text-blue-600 shadow-md transform scale-105':'text-gray-500 hover:text-gray-700'}`}>
              <Edit2 size={12}/>출제 서명
            </button>
            <button onClick={() => setViewMode('scope')} className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black transition-all duration-200 whitespace-nowrap flex items-center gap-1 ${viewMode==='scope'?'bg-white text-indigo-600 shadow-md transform scale-105':'text-gray-500 hover:text-gray-700'}`}>
              <CalendarDays size={12}/>시험 범위
            </button>
            <button onClick={() => {setViewMode('status'); setStatusTab('signature');}} className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black transition-all duration-200 whitespace-nowrap flex items-center gap-1 ${viewMode==='status'?'bg-white text-emerald-600 shadow-md transform scale-105':'text-gray-500 hover:text-gray-700'}`}>
              <BarChart3 size={12}/>제출 현황
            </button>
            <button onClick={() => setViewMode('admin')} className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black transition-all duration-200 whitespace-nowrap flex items-center gap-1 ${viewMode==='admin'?'bg-white text-purple-600 shadow-md transform scale-105':'text-gray-500 hover:text-gray-700'}`}>
              <Settings size={12}/>관리자
            </button>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-start p-4 md:p-8 animate-fade-in relative z-0 print:p-0">
          
          {/* 3-1. 교사 서명 화면 */}
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
                      <select value={selectedSubject} onChange={e=>{
                        setSelectedSubject(e.target.value); 
                        setSelectedTeacher('');
                        setSignatureData(null);
                        setDeleteStep(0);
                        setSubmitError('');
                      }} className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-base font-bold focus:border-blue-500 focus:bg-white transition-all appearance-none outline-none shadow-sm" required>
                        <option value="">과목을 선택하세요</option>
                        {Array.isArray(globalSettings.subjects) && globalSettings.subjects.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                      </select>
                      <div className="absolute right-4 bottom-4 pointer-events-none opacity-30"><Search size={18}/></div>
                    </div>

                    {selectedSubject && safeTeachers.length > 0 && (
                      <div className="animate-fade-in relative group">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 mb-1">Teacher</label>
                        <select value={selectedTeacher} onChange={e => {
                          setSelectedTeacher(e.target.value);
                          setSignatureData(null);
                          setDeleteStep(0);
                          setSubmitError('');
                        }} className="w-full p-4 bg-blue-50/50 border-2 border-blue-100 rounded-2xl text-base font-bold text-blue-800 focus:border-blue-500 focus:bg-white transition-all appearance-none outline-none shadow-sm" required>
                          <option value="">성함을 선택하세요</option>
                          {safeTeachers.map(t=><option key={t} value={t}>{t}</option>)}
                        </select>
                        <div className="absolute right-4 bottom-4 pointer-events-none opacity-30"><Users size={18}/></div>
                      </div>
                    )}

                    {selectedTeacher && (
                      existingSigForSelectedTeacher ? (
                        <div className="animate-fade-in p-5 bg-emerald-50 border-2 border-emerald-200 rounded-2xl text-center shadow-sm">
                          <CheckCircle className="mx-auto text-emerald-500 mb-2" size={36}/>
                          <p className="font-black text-emerald-800 mb-1 text-lg">제출 완료</p>
                          <p className="text-xs text-gray-500 mb-5 font-medium">제출일시: {getDisplayDate(existingSigForSelectedTeacher)}</p>
                          
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
                      ) : (
                        <div className="animate-fade-in space-y-3 pt-2">
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Signature</label>
                          <SignaturePad onSave={setSignatureData} resetTrigger={resetSigCounter} />
                          <button type="submit" disabled={isSaving || !signatureData} className="w-full py-5 bg-gray-900 text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-gray-200 hover:bg-black transition-all active:scale-95 disabled:bg-gray-300 flex items-center justify-center gap-2 mt-4">
                            {isSaving ? '클라우드에 안전하게 보존 중...' : <><Save size={20}/> 확인 및 서명 제출</>}
                          </button>
                          {submitError && <p className="text-red-500 text-xs font-bold text-center mt-2">{submitError}</p>}
                        </div>
                      )
                    )}
                  </div>
                </form>
              )}
            </div>
          )}

          {/* 3-2. 시험 범위 입력 화면 (선생님용) */}
          {viewMode === 'scope' && (
            <div className="w-full max-w-5xl animate-fade-in mt-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 px-2">
                <div>
                  <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2"><CalendarDays className="text-indigo-600"/> 시험 범위 입력</h2>
                  <p className="text-gray-500 text-sm font-medium mt-1">본인이 담당하는 과목의 [입력/수정] 버튼을 눌러 시험 범위를 작성해주세요.</p>
                </div>
              </div>
              {renderScheduleTable(false)}
            </div>
          )}

          {/* 3-3. 제출 현황 (비밀번호 없음) - 서명 현황 / 시험 범위 현황 통합 */}
          {viewMode === 'status' && (
            <div className="print-status-page w-full max-w-5xl bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white p-6 md:p-10 animate-fade-in mt-4 print:shadow-none print:p-0 print:mt-0 print:border-none print:bg-transparent">
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-gray-100 pb-6 print:hidden">
                <div className="flex flex-col gap-4 w-full md:w-auto">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-100 p-3 rounded-2xl"><BarChart3 className="text-emerald-600" size={24}/></div>
                    <div>
                      <h2 className="text-2xl font-black text-gray-800">문서 출력 및 제출 현황</h2>
                      <p className="text-gray-500 text-sm font-medium">서명 및 시험 범위 취합 결과를 확인하고 인쇄합니다.</p>
                    </div>
                  </div>
                  {/* 서브 탭 전환 버튼 */}
                  <div className="flex bg-gray-100 p-1 rounded-xl self-start">
                    <button onClick={() => setStatusTab('signature')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${statusTab === 'signature' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>출제 검토 서명 현황</button>
                    <button onClick={() => setStatusTab('scope')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${statusTab === 'scope' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>시험 범위표 출력</button>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 self-end md:self-center">
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 p-1 rounded-xl">
                    <History size={16} className="text-gray-400 ml-2"/>
                    <select 
                      value={viewingExamKey} 
                      onChange={(e) => setViewingExamKey(e.target.value)}
                      className="bg-transparent p-2 text-sm font-bold text-gray-700 outline-none pr-4"
                    >
                      {examOptions.map(opt => (
                        <option key={opt} value={opt}>{formatExamOption(opt)}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2">
                    {statusTab === 'signature' && (
                      <button
                        onClick={handleExportCSV}
                        className="bg-blue-50 text-blue-700 px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold hover:bg-blue-100 transition-colors border border-blue-200"
                      >
                        <Download size={16} /> 엑셀
                      </button>
                    )}

                    {statusTab === 'scope' && (
                      <button
                        onClick={handleExportScopeCSV}
                        className="bg-indigo-50 text-indigo-700 px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold hover:bg-indigo-100 transition-colors border border-indigo-200"
                      >
                        <Download size={16} /> 엑셀
                      </button>
                    )}

                    <button
                      onClick={() => window.print()}
                      className="bg-gray-800 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold hover:bg-black transition-colors shadow-md whitespace-nowrap"
                    >
                      <Printer size={16} /> {statusTab === 'scope' ? '범위표 인쇄' : '현황판 인쇄'}
                    </button>
                  </div>
                </div>
              </div>

              {/* 💡 서명 현황 탭 내용 */}
              {statusTab === 'signature' && (
                <div className="animate-fade-in print:block">
                  <div className="mb-6 print:mb-8 text-center text-lg font-black text-gray-800 bg-gray-50 py-3 rounded-xl print:bg-transparent print:p-0 border-b-2 print:border-black print:pb-4 print:hidden">
                    [출제 검토 서명 현황] {formatExamOption(viewingExamKey || `${globalSettings.year}|${globalSettings.semester}|${globalSettings.examName}`)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-2">
                    {subjectsToDisplay.map(subject => {
                      const subjectSignatures = viewingSignatures.filter(s => s.subject === subject.name);
                      const submittedNames = subjectSignatures.map(s => s.teacherName);
                      const totalCount = (subject.teachers || []).length;
                      const submittedCount = (subject.teachers || []).filter(t => submittedNames.includes(t)).length;
                      const isComplete = totalCount > 0 && submittedCount === totalCount;
                      
                      const printRecord = printStatuses.find(p => 
                        p.year === vYear && p.semester === vSem && p.examName === vExam && p.subjectName === subject.name
                      );

                      return (
                        <div key={subject.name} className={`relative p-6 rounded-3xl border-2 transition-all shadow-sm print:break-inside-avoid ${isComplete ? 'bg-emerald-50/50 border-emerald-100 print:border-gray-300 print:bg-white' : 'bg-white border-gray-200 print:border-gray-300'}`}>
                          <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2 print:border-gray-200">
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-black text-gray-800">{subject.name}</h3>
                              {subjectSignatures.length > 0 && (
                                <button onClick={() => {
                                  const sortedSigs = [...subjectSignatures].sort((a, b) => a.teacherName.localeCompare(b.teacherName, 'ko-KR'));
                                  setSelectedSubmission(sortedSigs);
                                }} className="print:hidden text-[11px] bg-blue-100 text-blue-700 px-2 py-1 rounded-md font-bold hover:bg-blue-200 flex items-center gap-1 transition-colors">
                                  <Printer size={12}/> 통합인쇄
                                </button>
                              )}
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-black ${isComplete ? 'bg-emerald-100 text-emerald-700 print:bg-gray-100 print:text-gray-800' : 'bg-gray-100 text-gray-600'}`}>
                              {submittedCount} / {totalCount} 명
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-2 mt-4">
                            {(subject.teachers || []).length === 0 ? (
                              <span className="text-xs text-gray-400">등록된 교사가 없습니다.</span>
                            ) : (
                              (subject.teachers || []).map(teacher => {
                                const sigRecord = subjectSignatures.find(s => s.teacherName === teacher);
                                const hasSubmitted = !!sigRecord;
                                
                                return (
                                  <div key={teacher} className={`flex items-center justify-between p-2.5 rounded-xl border print:border-none print:p-1 print:border-b ${hasSubmitted ? 'bg-white border-emerald-200 print:bg-white' : 'bg-gray-50 border-gray-200'}`}>
                                    <span className={`text-sm font-bold ${hasSubmitted ? 'text-gray-800' : 'text-gray-400'}`}>
                                      {teacher} 교사
                                    </span>
                                    {hasSubmitted ? (
                                      <button onClick={() => setSelectedSubmission([sigRecord])} className="flex items-center gap-1 text-[11px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-colors print:border-none print:bg-transparent print:text-gray-800">
                                        <FileText size={12} className="print:hidden"/> 개별 확인
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

              {/* 💡 시험 범위표 탭 내용 (인쇄용 레이아웃) */}
              {statusTab === 'scope' && (
                <div className="animate-fade-in print:block">
                  <div className="text-center mb-6 print:mb-8 hidden print:block">
                    <h2 className="text-3xl font-black tracking-widest">{vYear}학년도 {vSem}학기 {vExam} 시험 범위</h2>
                  </div>
                  {renderScheduleTable(true)}
                </div>
              )}
            </div>
          )}

          {/* 3-4. 관리자 설정 화면 (비밀번호 확인 필요) */}
          {viewMode === 'admin' && !isAdminUnlocked && (
            <div className="w-full max-w-sm bg-white rounded-[2rem] shadow-xl p-8 mt-12 animate-fade-in text-center border border-gray-100 print:hidden">
              <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="text-blue-500" size={28}/>
              </div>
              <h2 className="text-xl font-black text-gray-800 mb-2">관리자 암호 확인</h2>
              <p className="text-sm text-gray-500 mb-6 font-medium">초기 비밀번호는 <strong className="text-blue-600">1234</strong> 입니다.</p>
              <form onSubmit={handleUnlockAdmin}>
                <input type="password" value={pinInput} onChange={(e) => setPinInput(e.target.value)} placeholder="비밀번호 입력" className={`w-full p-4 bg-gray-50 border-2 rounded-xl text-center text-xl tracking-[0.5em] font-black outline-none transition-all ${pinError ? 'border-red-400 bg-red-50 text-red-600' : 'border-gray-200 focus:border-blue-500'}`} autoFocus />
                {pinError && <p className="text-xs font-bold text-red-500 mt-2">비밀번호가 일치하지 않습니다.</p>}
                <button type="submit" className="w-full py-4 mt-6 bg-gray-900 text-white rounded-xl font-black shadow-md hover:bg-black transition-all">확인</button>
              </form>
            </div>
          )}
          
          {viewMode === 'admin' && isAdminUnlocked && (
            <div className="w-full max-w-3xl bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white p-6 md:p-10 animate-fade-in mt-4 print:hidden">
              <div className="flex justify-between items-start mb-8 border-b border-gray-100 pb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-3 rounded-2xl"><Settings className="text-purple-600" size={24}/></div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-800">전체 환경 설정</h2>
                    <p className="text-gray-500 text-sm font-medium">학교의 시험 정보와 과목/교사를 영구 보관합니다.</p>
                  </div>
                </div>
                <button onClick={() => setIsAdminUnlocked(false)} className="text-xs text-gray-400 flex items-center gap-1 font-bold hover:text-gray-600"><Lock size={12}/> 잠그기</button>
              </div>

              {adminMessage.text && (
                <div className={`p-4 rounded-2xl mb-6 text-sm font-bold flex items-center gap-2 ${adminMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {adminMessage.type === 'success' ? <CheckCircle size={18}/> : <AlertCircle size={18}/>}
                  {adminMessage.text}
                </div>
              )}

              <div className="space-y-8">
                
                {/* 1. 기본 정보 */}
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

                {/* 2. 시험 시간표 설정 */}
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-lg font-black text-gray-800 mb-4 flex items-center gap-2"><CalendarDays size={20} className="text-purple-500"/> 시험 시간표 기본틀 관리</h3>
                  <div className="mb-6 p-5 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
                    <h4 className="text-sm font-black text-indigo-900 mb-2 flex items-center gap-2">
                      <FileText size={16}/> 엑셀 시간표 대량 붙여넣기
                    </h4>
                    <p className="text-xs text-indigo-700 mb-3 opacity-80 leading-relaxed">
                      엑셀에서 <strong>[일자] [학년] [교시] [과목]</strong> 4칸 형태의 표를 복사해 붙여넣으세요.<br/>
                      * 병합된 셀(예: 같은 날짜)은 빈칸으로 들어가므로, 엑셀에서 모든 칸에 날짜/학년을 채워 넣은 뒤 복사해야 완벽합니다!
                    </p>
                    <textarea
                      value={scheduleBulkInput}
                      onChange={e => setScheduleBulkInput(e.target.value)}
                      placeholder="예시)&#13;&#10;4월 27일 (월)&#9;1&#9;2&#9;공통국어1&#13;&#10;4월 27일 (월)&#9;1&#9;3&#9;한국사1"
                      className="w-full h-24 p-3 bg-white border border-indigo-200 rounded-xl text-sm outline-none focus:border-indigo-500 resize-none custom-scrollbar"
                    />
                    <button onClick={handleScheduleBulkPaste} type="button" className="mt-3 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-all shadow-sm active:scale-95">
                      시간표 일괄 적용하기
                    </button>
                  </div>
                  
                  <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                    {(!adminData.examSchedule || adminData.examSchedule.length === 0) && (
                      <p className="text-center text-sm text-gray-400 py-4">등록된 시간표가 없습니다.</p>
                    )}
                    {(adminData.examSchedule || []).map(item => (
                      <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-200 shadow-sm transition-all hover:border-indigo-200 text-sm">
                        <span className="font-medium text-gray-800">
                          <strong className="w-28 inline-block">{item.date}</strong> | 
                          <strong className="w-12 inline-block text-center">{item.grade}학년</strong> | 
                          <span className="w-12 inline-block text-center">{item.period}교시</span> | 
                          <strong className="ml-2 text-indigo-700">{item.subject}</strong>
                        </span>
                        <button onClick={() => removeScheduleItem(item.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1" title="삭제">
                          <Trash2 size={16}/>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-lg font-black text-gray-800 mb-4 flex items-center gap-2"><Users size={20} className="text-purple-500"/> 서명용 과목 및 교사 명단 보관함</h3>

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
                      placeholder="예시)&#13;&#10;공통국어1&#9;홍길동&#9;이순신"
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

                  <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                    {(adminData.subjects || []).map(subject => (
                      <div key={subject.name} className="bg-gray-50 border-2 border-gray-100 rounded-2xl p-4">
                        <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-3">
                          <span className="font-black text-lg text-purple-900">{subject.name}</span>
                          <button onClick={() => removeSubject(subject.name)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={16}/></button>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {(subject.teachers || []).map(teacher => (
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
                  <h3 className="text-lg font-black text-gray-800 mb-4 flex items-center gap-2">
                    <History size={20} className="text-red-500"/> 과거 시험 기록 관리 (삭제)
                  </h3>
                  <div className="bg-red-50/50 border-2 border-red-100 rounded-2xl p-4">
                    <p className="text-xs font-bold text-red-600 mb-4">
                      <AlertCircle size={14} className="inline mr-1 -mt-0.5"/> 
                      테스트로 만든 기록이나 불필요한 과거 기록을 영구적으로 삭제할 수 있습니다. (복구 불가)
                    </p>
                    {examOptions.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-2">기록된 시험이 없습니다.</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                        {examOptions.map(opt => (
                          <div key={opt} className="flex justify-between items-center bg-white p-3 rounded-xl border border-red-100 shadow-sm">
                            <span className="font-bold text-gray-800 text-sm">
                              {formatExamOption(opt)}
                            </span>
                            {deleteExamKey === opt ? (
                              <div className="flex gap-2">
                                <button onClick={() => setDeleteExamKey(null)} className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-300">취소</button>
                                <button onClick={() => executeDeleteExamRecords(opt)} className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 animate-pulse shadow-sm">
                                  확인(영구삭제)
                                </button>
                              </div>
                            ) : (
                              <button onClick={() => setDeleteExamKey(opt)} className="text-red-400 hover:text-red-600 flex items-center gap-1 text-xs font-bold bg-red-50 px-2 py-1 rounded-lg transition-colors border border-red-100">
                                <Trash2 size={14}/> 삭제
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <button onClick={handleAdminSave} className="w-full py-5 bg-purple-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-purple-200 hover:bg-purple-700 transition-all active:scale-95 flex items-center justify-center gap-2 mt-8 sticky bottom-4">
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
