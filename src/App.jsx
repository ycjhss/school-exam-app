import React, { useState, useRef, useEffect } from 'react';
import { 
  Save, CheckCircle, Trash2, Users, Check, AlertCircle, FileText, 
  Edit2, Search, Settings, Plus, X, BarChart3, Clock, List,
  Printer, Download, Lock, Unlock, Image as ImageIcon, History,
  CalendarDays, Edit, Home, Target, ClipboardList
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, doc, serverTimestamp, setDoc, deleteDoc } from 'firebase/firestore';

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
  @page { size: A4 landscape; margin: 0; }
  @media print {
    html, body, #root { width: 297mm !important; min-height: auto !important; margin: 0 !important; padding: 0 !important; background: #ffffff !important; overflow: visible !important; }
    .app-root { width: 297mm !important; min-height: auto !important; height: auto !important; margin: 0 !important; padding: 0 !important; display: block !important; background: #ffffff !important; overflow: visible !important; }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; text-shadow: none !important; box-shadow: none !important; }
    .print-document-modal { position: static !important; inset: auto !important; display: block !important; width: 297mm !important; min-height: 210mm !important; height: auto !important; max-height: none !important; margin: 0 !important; padding: 0 !important; overflow: visible !important; background: #ffffff !important; }
    .print-document-sheet { width: 297mm !important; max-width: none !important; min-height: 210mm !important; height: auto !important; margin: 0 !important; padding: 11mm 12mm 9mm 12mm !important; box-sizing: border-box !important; border-radius: 0 !important; box-shadow: none !important; overflow: visible !important; background: #ffffff !important; }
    .print-document-content { width: 100% !important; max-width: none !important; min-height: 190mm !important; margin: 0 !important; padding: 0 !important; overflow: visible !important; color: #000000 !important; background: #ffffff !important; display: flex !important; flex-direction: column !important; }
    .print-document-content h2 { margin: 0 0 6mm 0 !important; font-size: 19pt !important; line-height: 1.15 !important; letter-spacing: 0.08em !important; }
    .print-document-content p { margin: 0 0 5mm 0 !important; font-size: 10.5pt !important; line-height: 1.45 !important; }
    .print-document-content table { width: 100% !important; table-layout: auto !important; border-collapse: collapse !important; margin: 0 0 10mm 0 !important; page-break-inside: auto !important; break-inside: auto !important; }
    .print-document-content thead { display: table-header-group !important; }
    .print-document-content tr { page-break-inside: avoid !important; break-inside: avoid !important; }
    .print-document-content th { padding: 2mm 1mm !important; font-size: 9pt !important; line-height: 1.2 !important; background: #f3f4f6 !important; border: 1px solid #000 !important; text-align: center !important;}
    .print-document-content td { padding: 2mm 1mm !important; font-size: 9pt !important; line-height: 1.2 !important; border: 1px solid #000 !important; text-align: center !important;}
    .print-signature-area { flex: 0 0 auto !important; min-height: 0 !important; margin-top: 2mm !important; background: #ffffff !important; display: flex !important; flex-direction: column !important; }
    .print-status-page { width: 297mm !important; max-width: none !important; min-height: 210mm !important; margin: 0 !important; padding: 12mm !important; box-sizing: border-box !important; border: 0 !important; border-radius: 0 !important; box-shadow: none !important; background: #ffffff !important; overflow: visible !important; }
    .print-status-page table { page-break-inside: auto !important; }
    .print-status-page tr, .print-status-page .print\\:break-inside-avoid { page-break-inside: avoid !important; break-inside: avoid !important; }
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

const defaultAssessment2026S1 = [
  { grade: '1', subject: '공통국어1(4)', exam1: '30', exam2: '30', perf1: '20(20)', perf2: '20(20)', perf3: '', perf4: '', perf5: '', essay: '40', total: '100' },
  { grade: '1', subject: '공통수학1(4)', exam1: '30(1.8)', exam2: '30(1.8)', perf1: '20(14)', perf2: '20(14)', perf3: '', perf4: '', perf5: '', essay: '31.6', total: '100' },
  { grade: '1', subject: '공통영어1(4)', exam1: '30', exam2: '30', perf1: '30(30)', perf2: '10', perf3: '', perf4: '', perf5: '', essay: '30', total: '100' },
  { grade: '1', subject: '통합사회1(3)', exam1: '25', exam2: '25', perf1: '20(20)', perf2: '20(20)', perf3: '10', perf4: '', perf5: '', essay: '40', total: '100' },
  { grade: '1', subject: '한국사1(3)', exam1: '35(5.25)', exam2: '35(5.25)', perf1: '20(20)', perf2: '10', perf3: '', perf4: '', perf5: '', essay: '30.5', total: '100' },
  { grade: '1', subject: '통합과학1(3)', exam1: '20', exam2: '20', perf1: '20(15)', perf2: '20(10)', perf3: '20(10)', perf4: '', perf5: '', essay: '35', total: '100' },
  { grade: '1', subject: '과학탐구실험1(1)', exam1: '0', exam2: '0', perf1: '40', perf2: '30(30)', perf3: '30', perf4: '', perf5: '', essay: '30', total: '100' },
  { grade: '1', subject: '기술·가정(3)', exam1: '0', exam2: '30', perf1: '35(35)', perf2: '20', perf3: '15', perf4: '', perf5: '', essay: '35', total: '100' },
  { grade: '1', subject: '체육1(2)', exam1: '0', exam2: '0', perf1: '25', perf2: '25', perf3: '25', perf4: '25(25)', perf5: '', essay: '25', total: '100' },
  { grade: '1', subject: '음악1(2)', exam1: '0', exam2: '0', perf1: '40', perf2: '40', perf3: '20', perf4: '', perf5: '', essay: '20', total: '100' },
  { grade: '2', subject: '독서와 작문(4)', exam1: '30', exam2: '30', perf1: '20(20)', perf2: '20(20)', perf3: '', perf4: '', perf5: '', essay: '40', total: '100' },
  { grade: '2', subject: '대수(3)', exam1: '25(5)', exam2: '25(5)', perf1: '12(0)', perf2: '28(28)', perf3: '10(10)', perf4: '', perf5: '', essay: '48', total: '100' },
  { grade: '2', subject: '영어 I(3)', exam1: '30', exam2: '30', perf1: '30(30)', perf2: '10', perf3: '', perf4: '', perf5: '', essay: '30', total: '100' },
  { grade: '2', subject: '생명과학 I(3)', exam1: '25', exam2: '25', perf1: '15(10)', perf2: '20(10)', perf3: '15(10)', perf4: '', perf5: '', essay: '30', total: '100' },
  { grade: '2', subject: '스포츠생활1(3)', exam1: '0', exam2: '0', perf1: '25', perf2: '25', perf3: '25', perf4: '25(25)', perf5: '', essay: '25', total: '100' },
  { grade: '2', subject: '미술(3)', exam1: '0', exam2: '0', perf1: '30', perf2: '30', perf3: '20', perf4: '20(20)', perf5: '', essay: '20', total: '100' },
  { grade: '2', subject: '사회와문화(3)', exam1: '25', exam2: '25', perf1: '30(30)', perf2: '20', perf3: '', perf4: '', perf5: '', essay: '30', total: '100' },
  { grade: '2', subject: '현대사회와 윤리(3)', exam1: '27', exam2: '28', perf1: '30(30)', perf2: '15', perf3: '', perf4: '', perf5: '', essay: '30', total: '100' },
  { grade: '2', subject: '도시의 미래탐구(3)', exam1: '0', exam2: '40', perf1: '30(15)', perf2: '30(15)', perf3: '', perf4: '', perf5: '', essay: '30', total: '100' },
  { grade: '2', subject: '세계사(3)', exam1: '35', exam2: '35', perf1: '20(20)', perf2: '10(10)', perf3: '', perf4: '', perf5: '', essay: '30', total: '100' },
  { grade: '2', subject: '물리학 I(3)', exam1: '30', exam2: '30', perf1: '20(10)', perf2: '20(20)', perf3: '', perf4: '', perf5: '', essay: '30', total: '100' },
  { grade: '2', subject: '물질과 에너지(3)', exam1: '30', exam2: '25[10]', perf1: '25(10)', perf2: '20(10)', perf3: '', perf4: '', perf5: '', essay: '30', total: '100' },
  { grade: '2', subject: '융합과학탐구(3)', exam1: '0', exam2: '0', perf1: '35(15)', perf2: '35(15)', perf3: '30', perf4: '', perf5: '', essay: '30', total: '100' },
  { grade: '2', subject: '수학과제탐구(3)', exam1: '0', exam2: '0', perf1: '25', perf2: '25(25)', perf3: '25', perf4: '25(25)', perf5: '', essay: '50', total: '100' },
  { grade: '2', subject: '중국어 I(3)', exam1: '0', exam2: '50', perf1: '10', perf2: '20(20)', perf3: '20(20)', perf4: '', perf5: '', essay: '40', total: '100' },
  { grade: '2', subject: '일본어 I(3)', exam1: '0', exam2: '30', perf1: '25(20)', perf2: '25(10)', perf3: '20', perf4: '', perf5: '', essay: '30', total: '100' },
  { grade: '3', subject: '언어와 매체(3)', exam1: '30', exam2: '30', perf1: '15(15)', perf2: '15(15)', perf3: '10', perf4: '', perf5: '', essay: '30', total: '100' },
  { grade: '3', subject: '심화국어(2)', exam1: '0', exam2: '0', perf1: '40', perf2: '30(30)', perf3: '30(30)', perf4: '', perf5: '', essay: '60', total: '100' },
  { grade: '3', subject: '미적분(3)', exam1: '30(3.6)', exam2: '30(3.6)', perf1: '20(14)', perf2: '20(14)', perf3: '', perf4: '', perf5: '', essay: '35.2', total: '100' },
  { grade: '3', subject: '기하(2)', exam1: '0', exam2: '40(4)', perf1: '30(16)', perf2: '30(16)', perf3: '', perf4: '', perf5: '', essay: '36', total: '100' },
  { grade: '3', subject: '경제수학(3)', exam1: '0', exam2: '30', perf1: '35(20)', perf2: '35(20)', perf3: '', perf4: '', perf5: '', essay: '40', total: '100' },
  { grade: '3', subject: '영어독해와작문(4)', exam1: '30', exam2: '30', perf1: '20(20)', perf2: '20(20)', perf3: '', perf4: '', perf5: '', essay: '40', total: '100' },
  { grade: '3', subject: '영미문학읽기(2)', exam1: '0', exam2: '0', perf1: '40(30)', perf2: '30(30)', perf3: '30(10)', perf4: '', perf5: '', essay: '70', total: '100' },
  { grade: '3', subject: '생명과학 II(3)', exam1: '0', exam2: '40', perf1: '25(25)', perf2: '25(20)', perf3: '10', perf4: '', perf5: '', essay: '45', total: '100' },
  { grade: '3', subject: '화학 II(3)', exam1: '0', exam2: '30', perf1: '30(30)', perf2: '20(5)', perf3: '20', perf4: '', perf5: '', essay: '35', total: '100' },
  { grade: '3', subject: '물리학 II(3)', exam1: '0', exam2: '30', perf1: '20', perf2: '30(30)', perf3: '20', perf4: '', perf5: '', essay: '30', total: '100' },
  { grade: '3', subject: '생활과과학 II(3)', exam1: '0', exam2: '0', perf1: '30(10)', perf2: '35', perf3: '35(20)', perf4: '', perf5: '', essay: '30', total: '100' },
  { grade: '3', subject: '생활과윤리(3)', exam1: '27', exam2: '28', perf1: '30(30)', perf2: '15', perf3: '', perf4: '', perf5: '', essay: '30', total: '100' },
  { grade: '3', subject: '정치와 법(3)', exam1: '30(6)', exam2: '30(6)', perf1: '20(20)', perf2: '20', perf3: '', perf4: '', perf5: '', essay: '32', total: '100' },
  { grade: '3', subject: '세계시민(2)', exam1: '0', exam2: '0', perf1: '0', perf2: '0', perf3: '', perf4: '', perf5: '', essay: '0', total: 'P.F교과' },
  { grade: '3', subject: '여행지리(3)', exam1: '0', exam2: '0', perf1: '30', perf2: '30', perf3: '40(40)', perf4: '', perf5: '', essay: '40', total: '100' },
  { grade: '3', subject: '스포츠 생활(2)', exam1: '0', exam2: '0', perf1: '25', perf2: '25', perf3: '25', perf4: '25(25)', perf5: '', essay: '25', total: '100' },
  { grade: '3', subject: '음악감상과비평(2)', exam1: '0', exam2: '0', perf1: '40', perf2: '30', perf3: '30', perf4: '', perf5: '', essay: '30', total: '100' },
  { grade: '3', subject: '미술창작(2)', exam1: '0', exam2: '0', perf1: '30', perf2: '30', perf3: '20', perf4: '20(20)', perf5: '', essay: '20', total: '100' },
  { grade: '3', subject: '일본어 II(2)', exam1: '0', exam2: '0', perf1: '30', perf2: '30(30)', perf3: '30', perf4: '10', perf5: '', essay: '30', total: '100' },
  { grade: '3', subject: '중국어 II(2)', exam1: '0', exam2: '0', perf1: '20', perf2: '20(20)', perf3: '30(20)', perf4: '30', perf5: '', essay: '50', total: '100' },
  { grade: '3', subject: '인공지능기초(2)', exam1: '0', exam2: '0', perf1: '30(10)', perf2: '40', perf3: '30(30)', perf4: '', perf5: '', essay: '40', total: '100' },
  { grade: '3', subject: '정보과학(2)', exam1: '0', exam2: '0', perf1: '30(10)', perf2: '40(30)', perf3: '30', perf4: '', perf5: '', essay: '40', total: '100' }
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
  } catch (e) { return ''; }
};

const getDisplayDate = (sig) => {
  if (!sig) return '';
  const dateObj = sig.createdAt || sig.updatedAt || sig.printedAt;
  if (!dateObj) return '';
  try {
    if (typeof dateObj.toDate === 'function') return formatDateTime(dateObj.toDate().toISOString());
    if (typeof dateObj === 'string') return formatDateTime(dateObj);
    if (dateObj instanceof Date) return formatDateTime(dateObj.toISOString());
  } catch(e) { return ''; }
  return '';
};

const formatRatioOption = (opt) => {
  const [y, s] = (opt || '').split('|');
  return `${y}년 ${s}학기`;
};

const formatExamOption = (opt) => {
  const [y, s, e] = (opt || '').split('|');
  return `${y}년 ${s}학기 ${e === 'undefined' || !e ? '' : e}`;
};

const getScopeId = (vYear, vSem, vExam, item) => {
  return `${vYear}_${vSem}_${vExam}_${item.grade}_${item.subject}`.replace(/\s/g, '');
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
    ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.strokeStyle = '#000';
  };

  useEffect(() => {
    initCanvas(); window.addEventListener('resize', initCanvas);
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

  const startDrawing = (e) => { e.preventDefault(); setIsDrawing(true); const coords = getCoordinates(e); const ctx = canvasRef.current?.getContext('2d'); if (ctx) { ctx.beginPath(); ctx.moveTo(coords.x, coords.y); } };
  const draw = (e) => { e.preventDefault(); if (!isDrawing) return; const coords = getCoordinates(e); const ctx = canvasRef.current?.getContext('2d'); if (ctx) { ctx.lineTo(coords.x, coords.y); ctx.stroke(); } };
  const stopDrawing = () => { if (isDrawing) { setIsDrawing(false); if (canvasRef.current) { onSave(canvasRef.current.toDataURL()); } } };
  const clearCanvas = () => { const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext('2d'); if (ctx) { ctx.clearRect(0, 0, canvas.width, canvas.height); } onSave(null); };

  return (
    <div className="w-full animate-fade-in">
      <div className="border-2 border-gray-200 border-dashed rounded-2xl bg-white overflow-hidden relative h-40 shadow-inner group transition-all focus-within:border-blue-400">
        <canvas ref={canvasRef} className="w-full h-full touch-none cursor-crosshair" onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseOut={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} />
      </div>
      <div className="flex justify-between items-center mt-3 px-1">
        <span className="text-xs font-bold text-blue-600 flex items-center gap-1"><Edit2 size={12}/> 정자체로 서명해 주세요</span>
        <button onClick={clearCanvas} type="button" className="text-xs font-bold text-gray-400 hover:text-red-500 flex items-center gap-1 px-2 py-1 bg-white border border-gray-100 rounded-lg shadow-sm"><Trash2 size={12} /> 지우기</button>
      </div>
    </div>
  );
};

const RatioRow = ({ item, year, sem, grade, onSave, onDelete }) => {
  const [formData, setFormData] = useState(item);
  const [confirmName, setConfirmName] = useState(item.confirmedBy || '');

  useEffect(() => {
    setFormData(item);
    setConfirmName(item.confirmedBy || '');
  }, [JSON.stringify(item)]);

  const handleChange = (field, val) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: val };
      if (['exam1', 'exam2', 'perf1', 'perf2', 'perf3', 'perf4', 'perf5'].includes(field)) {
        let baseSum = 0; let essaySum = 0; let hasNumber = false;
        ['exam1', 'exam2', 'perf1', 'perf2', 'perf3', 'perf4', 'perf5'].forEach(f => {
          const rawVal = String(newData[f] || '').trim();
          if (!rawVal) return;
          const match = rawVal.match(/^([\d.]+)(?:[\(\[]([\d.]+)[\)\]])?/);
          if (match) {
            hasNumber = true;
            baseSum += parseFloat(match[1]) || 0;
            essaySum += parseFloat(match[2]) || 0;
          }
        });
        if (hasNumber) {
          newData.total = (Math.round(baseSum * 100) / 100).toString();
          newData.essay = (Math.round(essaySum * 100) / 100).toString();
        } else {
          newData.total = ''; newData.essay = '';
        }
      }
      return newData;
    });
  };

  const isConfirmed = formData.isConfirmed;

  return (
    <tr className="hover:bg-gray-50 transition-colors group">
      <td className="border border-gray-300 p-0 relative">
        {isConfirmed ? (
          <div className="w-full text-center p-1.5 text-[11px] font-bold text-gray-700 bg-gray-50">{formData.subject}</div>
        ) : (
          <input type="text" value={formData.subject} onChange={e=>handleChange('subject', e.target.value)} className="w-full text-center p-1.5 text-[11px] outline-none focus:bg-amber-50 font-bold bg-transparent" placeholder="과목명(학점)"/>
        )}
      </td>
      <td className="border border-gray-300 p-0">
        {isConfirmed ? <div className="w-full text-center p-1.5 text-[11px] text-gray-600 bg-gray-50">{formData.exam1}</div> : <input type="text" value={formData.exam1} onChange={e=>handleChange('exam1', e.target.value)} className="w-full text-center p-1.5 text-[11px] outline-none focus:bg-amber-50 bg-transparent"/>}
      </td>
      <td className="border border-gray-300 p-0">
        {isConfirmed ? <div className="w-full text-center p-1.5 text-[11px] text-gray-600 bg-gray-50">{formData.exam2}</div> : <input type="text" value={formData.exam2} onChange={e=>handleChange('exam2', e.target.value)} className="w-full text-center p-1.5 text-[11px] outline-none focus:bg-amber-50 bg-transparent"/>}
      </td>
      <td className="border border-gray-300 p-0">
        {isConfirmed ? <div className="w-full text-center p-1.5 text-[11px] text-gray-600 bg-gray-50">{formData.perf1}</div> : <input type="text" value={formData.perf1} onChange={e=>handleChange('perf1', e.target.value)} className="w-full text-center p-1.5 text-[11px] outline-none focus:bg-amber-50 bg-transparent"/>}
      </td>
      <td className="border border-gray-300 p-0">
        {isConfirmed ? <div className="w-full text-center p-1.5 text-[11px] text-gray-600 bg-gray-50">{formData.perf2}</div> : <input type="text" value={formData.perf2} onChange={e=>handleChange('perf2', e.target.value)} className="w-full text-center p-1.5 text-[11px] outline-none focus:bg-amber-50 bg-transparent"/>}
      </td>
      <td className="border border-gray-300 p-0">
        {isConfirmed ? <div className="w-full text-center p-1.5 text-[11px] text-gray-600 bg-gray-50">{formData.perf3}</div> : <input type="text" value={formData.perf3} onChange={e=>handleChange('perf3', e.target.value)} className="w-full text-center p-1.5 text-[11px] outline-none focus:bg-amber-50 bg-transparent"/>}
      </td>
      <td className="border border-gray-300 p-0">
        {isConfirmed ? <div className="w-full text-center p-1.5 text-[11px] text-gray-600 bg-gray-50">{formData.perf4}</div> : <input type="text" value={formData.perf4} onChange={e=>handleChange('perf4', e.target.value)} className="w-full text-center p-1.5 text-[11px] outline-none focus:bg-amber-50 bg-transparent"/>}
      </td>
      <td className="border border-gray-300 p-0">
        {isConfirmed ? <div className="w-full text-center p-1.5 text-[11px] text-gray-600 bg-gray-50">{formData.perf5}</div> : <input type="text" value={formData.perf5} onChange={e=>handleChange('perf5', e.target.value)} className="w-full text-center p-1.5 text-[11px] outline-none focus:bg-amber-50 bg-transparent"/>}
      </td>
      <td className="border border-gray-300 p-0 bg-amber-50/50">
        {isConfirmed ? <div className="w-full text-center p-1.5 text-[11px] font-bold text-amber-900 bg-gray-50">{formData.essay}</div> : <input type="text" value={formData.essay} onChange={e=>handleChange('essay', e.target.value)} className="w-full text-center p-1.5 text-[11px] font-bold text-amber-900 outline-none bg-transparent" title="자동계산 영역 (수동수정 가능)"/>}
      </td>
      <td className="border border-gray-300 p-0 bg-blue-50/50">
        {isConfirmed ? <div className="w-full text-center p-1.5 text-[11px] font-bold text-blue-900 bg-gray-50">{formData.total}</div> : <input type="text" value={formData.total} onChange={e=>handleChange('total', e.target.value)} className="w-full text-center p-1.5 text-[11px] font-bold text-blue-900 outline-none bg-transparent" placeholder="100"/>}
      </td>
      <td className="border border-gray-300 p-1 align-middle">
        {isConfirmed ? (
          <button onClick={() => onSave(formData, false, '', true)} className="w-full text-[10px] font-black text-emerald-600 flex items-center justify-center gap-1 bg-emerald-50 rounded hover:bg-emerald-100 py-1" title="클릭 시 확인 취소">
            <CheckCircle size={12}/> {formData.confirmedBy}
          </button>
        ) : (
          <div className="flex flex-col gap-1 items-center px-1">
            <input type="text" value={confirmName} onChange={e=>setConfirmName(e.target.value)} placeholder="성함" className="w-full text-[10px] p-1 border border-gray-300 rounded text-center outline-none focus:border-amber-500"/>
            <button onClick={() => onSave(formData, true, confirmName, false)} className="w-full bg-gray-800 text-white text-[10px] py-1 rounded hover:bg-black font-bold flex items-center justify-center gap-1">
              <Check size={10}/> 확인
            </button>
          </div>
        )}
      </td>
      <td className="border border-gray-300 p-1 align-middle opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex justify-center gap-1">
          {!isConfirmed && <button onClick={() => onSave(formData, false, '', false)} className="text-white bg-blue-500 hover:bg-blue-600 p-1.5 rounded shadow-sm" title="저장"><Save size={12}/></button>}
          {!isConfirmed && <button onClick={() => onDelete(item.id)} className="text-white bg-red-500 hover:bg-red-600 p-1.5 rounded shadow-sm" title="삭제"><Trash2 size={12}/></button>}
        </div>
      </td>
    </tr>
  );
};

const defaultActiveSettings = {
  ratio: { year: '2026', semester: '1' },
  signature: { year: '2026', semester: '1', examName: '1차 정기시험', documentDate: '2026. 4. 28.' },
  scope: { year: '2026', semester: '1', examName: '1차 정기시험' },
  cutoff: { year: '2026', semester: '1', examName: '1차 정기시험' }
};

export default function App() {
  const [user, setUser] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [viewMode, setViewMode] = useState('home'); 
  const [statusTab, setStatusTab] = useState('signature');
  
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const [selectedSubmission, setSelectedSubmission] = useState(null); 
  
  const [viewingExamKey, setViewingExamKey] = useState(''); 
  const [viewingRatioKey, setViewingRatioKey] = useState('');

  const defaultGlobalSettings = {
    adminPassword: '1234', 
    subjects: [
      { name: '공통국어1', teachers: ['홍길동', '이순신'] },
      { name: '한국사1', teachers: ['강감찬'] }
    ],
    checklist: defaultChecklistData,
    schedules: {},
    perfSchedules: {},
    activeSettings: defaultActiveSettings
  };

  const [globalSettings, setGlobalSettings] = useState(defaultGlobalSettings);
  
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [signatureData, setSignatureData] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [deleteStep, setDeleteStep] = useState(0); 
  const [resetSigCounter, setResetSigCounter] = useState(0);

  const [examScopes, setExamScopes] = useState([]);
  const [selectedScheduleItem, setSelectedScheduleItem] = useState(null);
  const [scopeInputText, setScopeInputText] = useState('');
  const [scopeInputTeacher, setScopeInputTeacher] = useState('');

  const [examCutoffs, setExamCutoffs] = useState([]);
  const [localCutoffExam, setLocalCutoffExam] = useState('');
  const [cutoffSubjectGrade, setCutoffSubjectGrade] = useState('');
  const [cutoffScores, setCutoffScores] = useState({ ab: '', bc: '', cd: '', de: '', ei: '' });
  const [cutoffTeacher, setCutoffTeacher] = useState('');

  const [assessmentRatios, setAssessmentRatios] = useState([]);
  const [ratioYear, setRatioYear] = useState('2026');
  const [ratioSem, setRatioSem] = useState('1');
  const [newRatioRows, setNewRatioRows] = useState([]);

  const [adminData, setAdminData] = useState(defaultGlobalSettings);
  const [newSubject, setNewSubject] = useState('');
  const [newTeachers, setNewTeachers] = useState({}); 
  const [adminMessage, setAdminMessage] = useState({ type: '', text: '' });
  const [bulkInput, setBulkInput] = useState(''); 
  
  const [scheduleBulkInput, setScheduleBulkInput] = useState('');
  const [newSchDate, setNewSchDate] = useState('');
  const [newSchGrade, setNewSchGrade] = useState('1');
  const [newSchPeriod, setNewSchPeriod] = useState('');
  const [newSchSubject, setNewSchSubject] = useState('');

  const [perfBulkInput, setPerfBulkInput] = useState(''); 
  const [newPerfGrade, setNewPerfGrade] = useState('1');
  const [newPerfSubject, setNewPerfSubject] = useState('');

  const [allSignatures, setAllSignatures] = useState([]); 
  const [printStatuses, setPrintStatuses] = useState([]); 
  const [newChecklistType, setNewChecklistType] = useState('item1');
  const [newChecklistText, setNewChecklistText] = useState('');
  const [deleteExamKey, setDeleteExamKey] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          try { await signInWithCustomToken(auth, __initial_auth_token); } catch (e) { await signInAnonymously(auth); }
        } else { await signInAnonymously(auth); }
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
          if (data.year && !data.activeSettings) {
            data.activeSettings = {
              ratio: { year: data.year, semester: data.semester },
              signature: { year: data.year, semester: data.semester, examName: data.examName, documentDate: data.documentDate },
              scope: { year: data.year, semester: data.semester, examName: data.examName },
              cutoff: { year: data.year, semester: data.semester, examName: data.examName }
            };
          }
          const resolvedData = { ...defaultGlobalSettings, ...data };
          setGlobalSettings(resolvedData); 
          
          if (!isDataLoaded) {
            setAdminData(resolvedData);
            setIsDataLoaded(true);
            const sRatio = resolvedData.activeSettings.ratio;
            const sExam = resolvedData.activeSettings.signature;
            setViewingRatioKey(`${sRatio.year}|${sRatio.semester}`);
            setViewingExamKey(`${sExam.year}|${sExam.semester}|${sExam.examName}`);
            setRatioYear(sRatio.year);
            setRatioSem(sRatio.semester);
          }
        } else { setIsDataLoaded(true); }
      },
      (err) => console.error(err)
    );
  }, [user, isDataLoaded]);

  useEffect(() => {
    if (!user) return;
    const unsubSigs = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'individualSignatures'), (snap) => setAllSignatures(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubPrints = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'printStatuses'), (snap) => setPrintStatuses(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubScopes = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'examScopes'), (snap) => setExamScopes(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubCutoffs = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'examCutoffs'), (snap) => setExamCutoffs(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubRatios = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'assessmentRatios'), (snap) => setAssessmentRatios(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => { unsubSigs(); unsubPrints(); unsubScopes(); unsubCutoffs(); unsubRatios(); };
  }, [user]);

  const handleUnlockAdmin = (e) => {
    e.preventDefault();
    const currentPassword = globalSettings.adminPassword || '1234';
    if (pinInput === currentPassword) { setIsAdminUnlocked(true); setPinError(false); setPinInput(''); } 
    else { setPinError(true); setPinInput(''); }
  };

  const activeRatio = globalSettings.activeSettings?.ratio || defaultActiveSettings.ratio;
  const activeSig = globalSettings.activeSettings?.signature || defaultActiveSettings.signature;
  const activeScope = globalSettings.activeSettings?.scope || defaultActiveSettings.scope;
  const activeCutoff = globalSettings.activeSettings?.cutoff || defaultActiveSettings.cutoff;

  useEffect(() => {
    if (activeCutoff?.examName && !localCutoffExam) {
      setLocalCutoffExam(activeCutoff.examName);
    }
  }, [activeCutoff, localCutoffExam]);

  const [vRatioYear, vRatioSem] = (viewingRatioKey || `${activeRatio.year}|${activeRatio.semester}`).split('|');
  
  let currentVYear, currentVSem, currentVExam;
  if (viewMode === 'scope') {
    currentVYear = String(activeScope.year); currentVSem = String(activeScope.semester); currentVExam = String(activeScope.examName);
  } else if (viewMode === 'cutoff') {
    currentVYear = String(activeCutoff.year); currentVSem = String(activeCutoff.semester); currentVExam = localCutoffExam || String(activeCutoff.examName);
  } else if (viewMode === 'teacher') {
    currentVYear = String(activeSig.year); currentVSem = String(activeSig.semester); currentVExam = String(activeSig.examName);
  } else {
    const parts = (viewingExamKey || `${activeSig.year}|${activeSig.semester}|${activeSig.examName}`).split('|');
    currentVYear = parts[0]; currentVSem = parts[1]; currentVExam = parts[2] || '';
  }
  const currentExamKey = `${currentVYear}|${currentVSem}|${currentVExam}`;
  const vYear = currentVYear; const vSem = currentVSem; const vExam = currentVExam;

  const viewingSignatures = allSignatures.filter(s => String(s.year) === vYear && String(s.semester) === vSem && String(s.examName) === vExam);
  const viewingScopes = examScopes.filter(s => String(s.year) === vYear && String(s.semester) === vSem && String(s.examName) === vExam);
  const viewingCutoffs = examCutoffs.filter(s => String(s.year) === vYear && String(s.semester) === vSem && String(s.examName) === vExam);
  
  let scheduleToDisplay = globalSettings.schedules?.[currentExamKey];
  if (!scheduleToDisplay || scheduleToDisplay.length === 0) {
    const legacyKey = `${globalSettings.year}|${globalSettings.semester}|${globalSettings.examName}`;
    if (currentExamKey === legacyKey && globalSettings.examSchedule?.length > 0) scheduleToDisplay = globalSettings.examSchedule;
  }
  if ((!scheduleToDisplay || scheduleToDisplay.length === 0) && viewingScopes.length > 0) {
    const recoveredMap = new Map();
    viewingScopes.forEach(s => {
      const key = `${s.date}_${s.grade}_${s.period}_${s.subject}`;
      if (!recoveredMap.has(key)) recoveredMap.set(key, { id: s.id, date: s.date || '-', grade: s.grade, period: s.period || '-', subject: s.subject });
    });
    scheduleToDisplay = Array.from(recoveredMap.values()).sort((a, b) => String(a.date).localeCompare(String(b.date)) || String(a.grade || '').localeCompare(String(b.grade || '')) || String(a.period).localeCompare(String(b.period)));
  }
  scheduleToDisplay = scheduleToDisplay || [];

  let subjectsToDisplay = Array.isArray(globalSettings.subjects) ? globalSettings.subjects.map(s => {
    const submittedTeachers = [...new Set(viewingSignatures.filter(sig => sig.subject === s.name).map(sig => sig.teacherName))];
    return { ...s, teachers: [...new Set([...(s.teachers || []), ...submittedTeachers])] };
  }) : [];
  const pastSubjects = [...new Set(viewingSignatures.map(s => s.subject))];
  pastSubjects.forEach(ps => {
    if (!subjectsToDisplay.find(s => s.name === ps)) {
      const submittedTeachers = [...new Set(viewingSignatures.filter(sig => sig.subject === ps).map(sig => sig.teacherName))];
      subjectsToDisplay.push({ name: ps, teachers: submittedTeachers });
    }
  });

  let cutoffSubjectOptions = [];
  if (localCutoffExam === '수행평가') {
    const perfKey = `${activeCutoff.year}|${activeCutoff.semester}`;
    let perfList = globalSettings.perfSchedules?.[perfKey] || [];
    const formUniqueMap = new Map();
    perfList.forEach(item => { formUniqueMap.set(`${item.grade}|${item.subject}`, { grade: item.grade, subject: item.subject }); });
    const formCutoffs = examCutoffs.filter(c => String(c.year) === String(activeCutoff.year) && String(c.semester) === String(activeCutoff.semester) && String(c.examName) === '수행평가');
    formCutoffs.forEach(c => { formUniqueMap.set(`${c.grade}|${c.subject}`, { grade: c.grade, subject: c.subject }); });
    cutoffSubjectOptions = Array.from(formUniqueMap.values()).sort((a,b) => String(a.grade || '').localeCompare(String(b.grade || '')) || String(a.subject || '').localeCompare(String(b.subject || '')));
  } else {
    const formExamKey = `${activeCutoff.year}|${activeCutoff.semester}|${localCutoffExam}`;
    let formSchedule = globalSettings.schedules?.[formExamKey] || [];
    if (formSchedule.length === 0 && formExamKey === `${globalSettings.year}|${globalSettings.semester}|${globalSettings.examName}`) {
      formSchedule = globalSettings.examSchedule || [];
    }
    const formScopes = examScopes.filter(s => String(s.year) === String(activeCutoff.year) && String(s.semester) === String(activeCutoff.semester) && String(s.examName) === localCutoffExam);
    if (formSchedule.length === 0 && formScopes.length > 0) {
      const recoveredMap = new Map();
      formScopes.forEach(s => {
        const key = `${s.grade}_${s.subject}`;
        if (!recoveredMap.has(key)) recoveredMap.set(key, { grade: s.grade, subject: s.subject });
      });
      formSchedule = Array.from(recoveredMap.values());
    }
    const formUniqueMap = new Map();
    formSchedule.forEach(item => { formUniqueMap.set(`${item.grade}|${item.subject}`, { grade: item.grade, subject: item.subject }); });
    const formCutoffs = examCutoffs.filter(c => String(c.year) === String(activeCutoff.year) && String(c.semester) === String(activeCutoff.semester) && String(c.examName) === localCutoffExam);
    formCutoffs.forEach(c => { formUniqueMap.set(`${c.grade}|${c.subject}`, { grade: c.grade, subject: c.subject }); });
    cutoffSubjectOptions = Array.from(formUniqueMap.values()).sort((a,b) => String(a.grade || '').localeCompare(String(b.grade || '')) || String(a.subject || '').localeCompare(String(b.subject || '')));
  }

  const handleTeacherSubmit = async (e) => {
    e.preventDefault();
    if (!signatureData || !user) return;
    setIsSaving(true); setSubmitError('');
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'individualSignatures'), {
        year: String(activeSig.year), semester: String(activeSig.semester), examName: String(activeSig.examName),
        subject: selectedSubject, teacherName: selectedTeacher, signatureData, checklistSnapshot: globalSettings.checklist || defaultChecklistData, 
        createdAt: serverTimestamp(), uid: user.uid
      });
      setSaveSuccess(true); setSelectedTeacher(''); setSignatureData(null); setResetSigCounter(c => c+1);
      setTimeout(() => { setSaveSuccess(false); setSelectedSubject(''); }, 3000);
    } catch (e) { setSubmitError("데이터베이스 연결 오류입니다. 관리자에게 문의하세요."); setTimeout(() => setSubmitError(''), 4000); }
    setIsSaving(false);
  };

  const confirmDeleteSignature = async (id) => {
    try { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'individualSignatures', id)); setSignatureData(null); setDeleteStep(0); } 
    catch (error) { console.error(error); }
  };

  const handleScopeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedScheduleItem) { alert("과목을 선택해주세요."); return; }
    setIsSaving(true);
    try {
      const docId = getScopeId(currentVYear, currentVSem, currentVExam, selectedScheduleItem);
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'examScopes', docId), {
        year: currentVYear, semester: currentVSem, examName: currentVExam, date: selectedScheduleItem.date, grade: selectedScheduleItem.grade,
        period: selectedScheduleItem.period, subject: selectedScheduleItem.subject, scopeText: scopeInputText, teacherName: scopeInputTeacher.trim(),
        updatedAt: serverTimestamp()
      });
      setSelectedScheduleItem(null); setScopeInputText(''); setScopeInputTeacher('');
    } catch (err) { alert("저장 중 오류가 발생했습니다."); }
    setIsSaving(false);
  };

  const handleCutoffSubmit = async (e) => {
    e.preventDefault();
    if (!cutoffSubjectGrade) { alert("과목을 선택해주세요."); return; }
    
    const isAllEmpty = !cutoffScores.ab && !cutoffScores.bc && !cutoffScores.cd && !cutoffScores.de && !cutoffScores.ei;
    
    if (!isAllEmpty && !cutoffTeacher.trim()) {
      alert("입력자 성함을 필수적으로 입력해주세요.");
      return;
    }

    setIsSaving(true);
    try {
      const [g, s] = cutoffSubjectGrade.split('|');
      const docId = `${currentVYear}_${currentVSem}_${currentVExam}_${g}_${s}`.replace(/\s/g, '');

      if (isAllEmpty) {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'examCutoffs', docId));
        alert("입력된 점수가 없어 기존 기록이 완전히 삭제(초기화)되었습니다.");
      } else {
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'examCutoffs', docId), {
          year: currentVYear, semester: currentVSem, examName: currentVExam, grade: g, subject: s,
          ab: cutoffScores.ab, bc: cutoffScores.bc, cd: cutoffScores.cd, de: cutoffScores.de, ei: cutoffScores.ei,
          teacherName: cutoffTeacher.trim(), updatedAt: serverTimestamp()
        });
        alert("추정분할 점수가 안전하게 저장되었습니다.");
      }
      setCutoffSubjectGrade('');
    } catch(err) { alert("저장 중 오류가 발생했습니다."); }
    setIsSaving(false);
  };

  const inputRatios = assessmentRatios.filter(r => String(r.year) === String(ratioYear) && String(r.semester) === String(ratioSem));
  let displayRatios = [];
  if (String(ratioYear) === '2026' && String(ratioSem) === '1') {
    displayRatios = defaultAssessment2026S1.map(def => {
      const found = inputRatios.find(r => r.subject === def.subject && String(r.grade) === String(def.grade));
      return found ? found : { ...def, year: '2026', semester: '1', id: `def_2026_1_${def.grade}_${def.subject}`.replace(/\s/g, ''), isUnsavedDefault: true };
    });
    inputRatios.forEach(r => {
      if (!displayRatios.find(d => d.subject === r.subject && String(d.grade) === String(r.grade))) displayRatios.push(r);
    });
  } else {
    displayRatios = [...inputRatios];
  }
  displayRatios = [...displayRatios, ...newRatioRows.filter(r => String(r.year) === String(ratioYear) && String(r.semester) === String(ratioSem))];

  const handleRatioSave = async (data, isConfirm = false, confirmName = '', isUnconfirm = false) => {
    const totalVal = String(data.total || '').trim();
    if (!isUnconfirm && totalVal !== '100' && totalVal !== 'P.F교과') {
      alert(`입력하신 비율의 계(총합)가 100이 아닙니다! (현재: ${totalVal})\n100%가 되도록 수정한 후 저장/확인해 주세요.`); return;
    }
    if (isConfirm && !confirmName.trim()) { alert("확인자 성함을 입력해주세요."); return; }
    if (!data.subject) { alert("과목명을 입력해야 합니다."); return; }

    try {
      const docId = `${data.year}_${data.semester}_${data.grade}_${data.subject}`.replace(/\s/g, '');
      const finalData = {
        ...data, isConfirmed: isUnconfirm ? false : (isConfirm ? true : data.isConfirmed || false),
        confirmedBy: isUnconfirm ? '' : (isConfirm ? confirmName.trim() : data.confirmedBy || ''), updatedAt: serverTimestamp()
      };
      delete finalData.isUnsavedDefault; delete finalData.id;
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'assessmentRatios', docId), finalData);
      setNewRatioRows(prev => prev.filter(r => r.id !== data.id));
      if (isConfirm) alert("확인 완료되었습니다."); else if (isUnconfirm) alert("확인이 취소되었습니다."); else alert("저장되었습니다.");
    } catch (e) { alert("처리 중 오류가 발생했습니다."); }
  };

  const handleRatioDelete = async (id) => {
    if (!confirm("이 과목을 삭제하시겠습니까? (초기 데이터는 새로고침 시 다시 나타납니다)")) return;
    if (id.startsWith('new_')) setNewRatioRows(prev => prev.filter(r => r.id !== id));
    else if (!id.startsWith('def_')) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'assessmentRatios', id));
  };

  const handleAdminSave = async () => {
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'global'), adminData);
      setAdminMessage({ type: 'success', text: '설정이 안전하게 저장되었습니다.' }); setTimeout(() => setAdminMessage({ type: '', text: '' }), 3000);
    } catch (e) { setAdminMessage({ type: 'error', text: '저장에 실패했습니다.' }); setTimeout(() => setAdminMessage({ type: '', text: '' }), 5000); }
  };

  const executeDeleteExamRecords = async (examKey) => {
    const [dYear, dSem, dExam] = examKey.split('|');
    try {
      const sigsToDelete = allSignatures.filter(s => String(s.year) === dYear && String(s.semester) === dSem && String(s.examName) === dExam);
      for (const sig of sigsToDelete) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'individualSignatures', sig.id));
      const printsToDelete = printStatuses.filter(p => String(p.year) === dYear && String(p.semester) === dSem && String(p.examName) === dExam);
      for (const p of printsToDelete) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'printStatuses', p.id));
      const scopesToDelete = examScopes.filter(s => String(s.year) === dYear && String(s.semester) === dSem && String(s.examName) === dExam);
      for (const sc of scopesToDelete) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'examScopes', sc.id));
      const cutoffsToDelete = examCutoffs.filter(s => String(s.year) === dYear && String(s.semester) === dSem && String(s.examName) === dExam);
      for (const cu of cutoffsToDelete) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'examCutoffs', cu.id));

      setDeleteExamKey(null); setAdminMessage({ type: 'success', text: `과거 모든 기록이 영구 삭제되었습니다.` }); setTimeout(() => setAdminMessage({ type: '', text: '' }), 4000);
    } catch (e) { setAdminMessage({ type: 'error', text: '삭제 중 오류가 발생했습니다.' }); setTimeout(() => setAdminMessage({ type: '', text: '' }), 4000); }
  };

  const handleBulkPaste = () => {
    if(!bulkInput.trim()) return;
    const lines = bulkInput.split('\n'); const newSubjectsMap = {};
    (adminData.subjects || []).forEach(s => { newSubjectsMap[s.name] = new Set(s.teachers || []); });
    lines.forEach(line => {
      const parts = line.split('\t').map(p => p.trim()).filter(Boolean);
      if (parts.length > 0) { const subjectName = parts[0]; if (!newSubjectsMap[subjectName]) newSubjectsMap[subjectName] = new Set(); for (let i = 1; i < parts.length; i++) newSubjectsMap[subjectName].add(parts[i]); }
    });
    const updatedSubjects = Object.keys(newSubjectsMap).map(name => ({ name, teachers: Array.from(newSubjectsMap[name]) }));
    setAdminData(prev => ({ ...prev, subjects: updatedSubjects }));
    setBulkInput(''); setAdminMessage({ type: 'success', text: '엑셀 명단 적용됨. 꼭 [저장하기]를 누르세요.' }); setTimeout(() => setAdminMessage({ type: '', text: '' }), 4000);
  };

  const handleScheduleBulkPaste = () => {
    if(!scheduleBulkInput.trim()) return;
    const lines = scheduleBulkInput.split('\n');
    const newSchedule = lines.map((line, i) => {
      const parts = line.split('\t').map(p => p.trim()).filter(Boolean);
      if (parts.length >= 4) return { id: Date.now() + i, date: parts[0], grade: parts[1], period: parts[2], subject: parts[3] }; return null;
    }).filter(Boolean);
    setAdminData(prev => {
      const key = `${prev.activeSettings.scope.year}|${prev.activeSettings.scope.semester}|${prev.activeSettings.scope.examName}`;
      const existing = prev.schedules?.[key] || [];
      return { ...prev, schedules: { ...(prev.schedules || {}), [key]: [...existing, ...newSchedule] } };
    });
    setScheduleBulkInput(''); setAdminMessage({ type: 'success', text: '해당 시험에 시간표 추가됨. 꼭 [저장하기]를 누르세요.' }); setTimeout(() => setAdminMessage({ type: '', text: '' }), 4000);
  };

  const handleAddSingleSchedule = () => {
    if (!newSchDate.trim() || !newSchSubject.trim()) return;
    setAdminData(prev => {
      const key = `${prev.activeSettings.scope.year}|${prev.activeSettings.scope.semester}|${prev.activeSettings.scope.examName}`;
      const existing = prev.schedules?.[key] || [];
      return { ...prev, schedules: { ...(prev.schedules || {}), [key]: [...existing, { id: Date.now(), date: newSchDate.trim(), grade: newSchGrade, period: newSchPeriod.trim(), subject: newSchSubject.trim() }] } };
    });
    setNewSchSubject(''); setNewSchDate(''); setNewSchPeriod('');
  };

  const removeScheduleItem = (id) => {
    setAdminData(prev => {
      const key = `${prev.activeSettings.scope.year}|${prev.activeSettings.scope.semester}|${prev.activeSettings.scope.examName}`;
      const existing = prev.schedules?.[key] || [];
      return { ...prev, schedules: { ...(prev.schedules || {}), [key]: existing.filter(item => item.id !== id) } };
    });
  };

  const handlePerfBulkPaste = () => {
    if(!perfBulkInput.trim()) return;
    const lines = perfBulkInput.split('\n');
    const newPerf = lines.map((line, i) => {
      const parts = line.split('\t').map(p => p.trim()).filter(Boolean);
      if (parts.length >= 2) return { id: Date.now() + i, grade: parts[0], subject: parts[1] }; return null;
    }).filter(Boolean);
    setAdminData(prev => {
      const key = `${prev.activeSettings.cutoff.year}|${prev.activeSettings.cutoff.semester}`;
      const existing = prev.perfSchedules?.[key] || [];
      return { ...prev, perfSchedules: { ...(prev.perfSchedules || {}), [key]: [...existing, ...newPerf] } };
    });
    setPerfBulkInput(''); setAdminMessage({ type: 'success', text: '수행평가 과목이 추가되었습니다. 꼭 [저장하기]를 누르세요.' }); setTimeout(() => setAdminMessage({ type: '', text: '' }), 4000);
  };

  const handleAddSinglePerf = () => {
    if (!newPerfSubject.trim()) return;
    setAdminData(prev => {
      const key = `${prev.activeSettings.cutoff.year}|${prev.activeSettings.cutoff.semester}`;
      const existing = prev.perfSchedules?.[key] || [];
      return { ...prev, perfSchedules: { ...(prev.perfSchedules || {}), [key]: [...existing, { id: Date.now(), grade: newPerfGrade, subject: newPerfSubject.trim() }] } };
    });
    setNewPerfSubject('');
  };

  const removePerfItem = (id) => {
    setAdminData(prev => {
      const key = `${prev.activeSettings.cutoff.year}|${prev.activeSettings.cutoff.semester}`;
      const existing = prev.perfSchedules?.[key] || [];
      return { ...prev, perfSchedules: { ...(prev.perfSchedules || {}), [key]: existing.filter(item => item.id !== id) } };
    });
  };

  const ratioKeys = new Set(assessmentRatios.map(s => `${s.year}|${s.semester}`));
  ratioKeys.add(`${activeRatio.year}|${activeRatio.semester}`); ratioKeys.add('2026|1'); 
  const ratioOptions = Array.from(ratioKeys).sort((a,b) => String(b).localeCompare(String(a)));

  const examKeys = new Set([
    ...allSignatures.map(s => `${s.year}|${s.semester}|${s.examName}`), ...examScopes.map(s => `${s.year}|${s.semester}|${s.examName}`), ...examCutoffs.map(s => `${s.year}|${s.semester}|${s.examName}`)
  ]);
  examKeys.add(`${activeSig.year}|${activeSig.semester}|${activeSig.examName}`);
  examKeys.add(`${activeScope.year}|${activeScope.semester}|${activeScope.examName}`);
  examKeys.add(`${activeCutoff.year}|${activeCutoff.semester}|${activeCutoff.examName}`);
  const examOptions = Array.from(examKeys).sort((a,b) => String(b).localeCompare(String(a))); 

  const escapeCSV = (value) => { if (value === null || value === undefined) return ''; return `"${String(value).replace(/"/g, '""')}"`; };

  const handleExportCSV = () => {
    let csv = "\uFEFF과목명,교사명,제출상태,서명(클라우드기록)시간\n";
    subjectsToDisplay.forEach(subject => {
      const subjectSigs = viewingSignatures.filter(s => s.subject === subject.name);
      (subject.teachers || []).forEach(teacher => {
        const sig = subjectSigs.find(s => s.teacherName === teacher);
        csv += `${subject.name},${teacher},${sig ? "제출완료" : "미제출"},${getDisplayDate(sig)}\n`;
      });
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url;
    link.download = `출제검토현황_${vYear}_${vSem}학기_${vExam}.csv`; document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const handleExportScopeCSV = () => {
    let csv = "\uFEFF일자,학년,교시,과목,시험 범위\n";
    scheduleToDisplay.forEach((item) => {
      const scopeId = getScopeId(vYear, vSem, vExam, item); const scopeDoc = viewingScopes.find(s => s.id === scopeId);
      const row = [item.date, item.grade, item.period, item.subject, scopeDoc ? (scopeDoc.scopeText || '') : ''];
      csv += row.map(escapeCSV).join(',') + '\n';
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url;
    link.download = `시험범위표_${vYear}_${vSem}학기_${vExam}.csv`; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
  };

  const handleExportCutoffCSV = () => {
    let csv = "\uFEFF과목명(학년),A/B,B/C,C/D,D/E,E/I\n";
    uniqueSubjectGrades.forEach(item => {
      const docId = `${vYear}_${vSem}_${vExam}_${item.grade}_${item.subject}`.replace(/\s/g, '');
      const cutoffDoc = viewingCutoffs.find(c => c.id === docId);
      if (cutoffDoc) {
        const row = [`${item.subject}(${item.grade})`, cutoffDoc.ab, cutoffDoc.bc, cutoffDoc.cd, cutoffDoc.de, cutoffDoc.ei];
        csv += row.map(escapeCSV).join(',') + '\n';
      }
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url;
    link.download = `추정분할점수표_${vYear}_${vSem}학기_${vExam}.csv`; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
  };

  const handleExportRatioCSV = () => {
    let csv = "\uFEFF학년,과목(학점),1차 정기시험,2차 정기시험,수행평가(1),수행평가(2),수행평가(3),수행평가(4),수행평가(5),논술형 비율(%),계,최종확인\n";
    const currentStatusRatios = assessmentRatios.filter(r => String(r.year) === String(vRatioYear) && String(r.semester) === String(vRatioSem));
    let exportRatios = [];
    if (String(vRatioYear) === '2026' && String(vRatioSem) === '1') {
      exportRatios = defaultAssessment2026S1.map(def => {
        const found = currentStatusRatios.find(r => r.subject === def.subject && String(r.grade) === String(def.grade));
        return found ? found : { ...def, year: '2026', semester: '1' };
      });
      currentStatusRatios.forEach(r => { if (!exportRatios.find(d => d.subject === r.subject && String(d.grade) === String(r.grade))) exportRatios.push(r); });
    } else { exportRatios = [...currentStatusRatios]; }

    [1, 2, 3].forEach(g => {
      const gradeRatios = exportRatios.filter(r => String(r.grade) === String(g));
      gradeRatios.forEach(r => {
        const row = [g, r.subject, r.exam1, r.exam2, r.perf1, r.perf2, r.perf3, r.perf4, r.perf5, r.essay, r.total, r.isConfirmed ? r.confirmedBy : '미확인'];
        csv += row.map(escapeCSV).join(',') + '\n';
      });
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url;
    link.download = `평가비율표_${vRatioYear}_${vRatioSem}학기.csv`; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
  };

  const togglePrintStatus = async (subjectName, isCurrentlyPrinted) => {
    const docId = `${vYear}_${vSem}_${vExam}_${subjectName}`;
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'printStatuses', docId);
    try {
      if (isCurrentlyPrinted) await deleteDoc(docRef);
      else await setDoc(docRef, { year: vYear, semester: vSem, examName: vExam, subjectName: subjectName, printedAt: new Date().toISOString() });
    } catch (error) { console.error(error); }
  };

  const addSubject = () => { if(!newSubject.trim()) return; setAdminData(prev => ({ ...prev, subjects: [...(prev.subjects || []), { name: newSubject.trim(), teachers: [] }] })); setNewSubject(''); };
  const removeSubject = (subjectName) => { setAdminData(prev => ({ ...prev, subjects: (prev.subjects || []).filter(s => s.name !== subjectName) })); };
  const addTeacherToSubject = (subjectName) => { const teacherName = newTeachers[subjectName]?.trim(); if(!teacherName) return; setAdminData(prev => ({ ...prev, subjects: (prev.subjects || []).map(s => s.name === subjectName ? { ...s, teachers: [...(s.teachers || []), teacherName] } : s) })); setNewTeachers(prev => ({ ...prev, [subjectName]: '' })); };
  const removeTeacherFromSubject = (subjectName, teacherName) => { setAdminData(prev => ({ ...prev, subjects: (prev.subjects || []).map(s => s.name === subjectName ? { ...s, teachers: (s.teachers || []).filter(t => t !== teacherName) } : s) })); };
  const addChecklistItem = () => { if(!newChecklistText.trim()) return; const newItem = { id: Date.now(), type: newChecklistType, text: newChecklistText.trim(), status: 'O' }; setAdminData(prev => ({ ...prev, checklist: [...(prev.checklist || defaultChecklistData), newItem] })); setNewChecklistText(''); };
  const removeChecklistItem = (id) => { setAdminData(prev => ({ ...prev, checklist: (prev.checklist || defaultChecklistData).filter(item => item.id !== id) })); };
  const updateChecklistStatus = (id, newStatus) => { setAdminData(prev => ({ ...prev, checklist: (prev.checklist || defaultChecklistData).map(item => item.id === id ? { ...item, status: newStatus } : item ) })); };

  const renderScheduleTable = (isPrintView = false) => {
    if (scheduleToDisplay.length === 0) return <div className="p-8 text-center text-gray-500 font-bold bg-gray-50 rounded-2xl">등록된 시험 시간표가 없습니다.</div>;
    const dateSpans = {}; const gradeSpans = {};
    scheduleToDisplay.forEach(item => { dateSpans[item.date] = (dateSpans[item.date] || 0) + 1; const gradeKey = `${item.date}_${item.grade}`; gradeSpans[gradeKey] = (gradeSpans[gradeKey] || 0) + 1; });
    const renderedDates = new Set(); const renderedGrades = new Set();

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
              const scopeId = getScopeId(vYear, vSem, vExam, item); const scopeDoc = viewingScopes.find(s => s.id === scopeId); const gradeKey = `${item.date}_${item.grade}`;
              const showDate = !renderedDates.has(item.date); if (showDate) renderedDates.add(item.date);
              const showGrade = !renderedGrades.has(gradeKey); if (showGrade) renderedGrades.add(gradeKey);
              return (
                <tr key={item.id || idx}>
                  {showDate && <td rowSpan={dateSpans[item.date]} className="border border-black p-2 align-middle whitespace-pre-wrap">{item.date}</td>}
                  {showGrade && <td rowSpan={gradeSpans[gradeKey]} className="border border-black p-2 align-middle font-bold">{item.grade}</td>}
                  <td className="border border-black p-2">{item.period}</td>
                  <td className="border border-black p-2 font-bold">{item.subject}</td>
                  <td className="border border-black p-3 text-left whitespace-pre-wrap min-w-[200px] leading-relaxed">
                    {scopeDoc ? scopeDoc.scopeText : (isPrintView ? '' : <span className="text-gray-300 italic">미입력</span>)}
                    {!isPrintView && scopeDoc && <div className="text-[10px] text-gray-400 mt-2 font-medium text-right">수정: {scopeDoc.teacherName || '-'} ({getDisplayDate(scopeDoc)})</div>}
                  </td>
                  {!isPrintView && (
                    <td className="border border-black p-2 align-middle">
                      <button onClick={() => { setSelectedScheduleItem(item); setScopeInputText(scopeDoc?.scopeText || ''); setScopeInputTeacher(scopeDoc?.teacherName || ''); }} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all w-full flex items-center justify-center gap-1 ${scopeDoc ? 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100' : 'bg-gray-800 text-white hover:bg-black'}`}>
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

  const renderCutoffTable = (isPrintView = false) => {
    const submittedCutoffs = uniqueSubjectGrades.map(item => {
      const docId = `${vYear}_${vSem}_${vExam}_${item.grade}_${item.subject}`.replace(/\s/g, '');
      const doc = viewingCutoffs.find(c => c.id === docId);
      return doc ? { ...item, ...doc } : null;
    }).filter(Boolean);

    if (submittedCutoffs.length === 0) return <div className="p-8 text-center text-gray-500 font-bold bg-gray-50 rounded-2xl">입력된 추정분할 점수가 없습니다.</div>;

    return (
      <div className={`w-full overflow-x-auto ${isPrintView ? 'print:overflow-visible' : 'bg-white rounded-2xl shadow-sm border border-gray-200'}`}>
        <table className={`w-full border-collapse border-2 border-black text-center text-[15px] ${isPrintView ? 'print:text-[14px] print:w-full' : ''}`}>
          <thead>
            <tr>
              <th className="border-2 border-black p-2 bg-gray-100 font-black whitespace-nowrap">과목명(학년)</th>
              <th className="border-2 border-black p-2 bg-gray-100 font-black w-20">A/B</th>
              <th className="border-2 border-black p-2 bg-gray-100 font-black w-20">B/C</th>
              <th className="border-2 border-black p-2 bg-gray-100 font-black w-20">C/D</th>
              <th className="border-2 border-black p-2 bg-gray-100 font-black w-20">D/E</th>
              <th className="border-2 border-black p-2 bg-gray-100 font-black w-20">E/I</th>
              {!isPrintView && <th className="border-2 border-black p-2 bg-gray-100 font-black w-32 print:hidden">기록 정보</th>}
            </tr>
          </thead>
          <tbody>
            {submittedCutoffs.map((item, idx) => (
              <tr key={idx}>
                <td className="border border-black p-2 font-bold whitespace-nowrap">{item.subject}({item.grade})</td>
                <td className="border border-black p-2 font-medium text-gray-800">{item.ab}</td>
                <td className="border border-black p-2 font-medium text-gray-800">{item.bc}</td>
                <td className="border border-black p-2 font-medium text-gray-800">{item.cd}</td>
                <td className="border border-black p-2 font-medium text-gray-800">{item.de}</td>
                <td className="border border-black p-2 font-medium text-gray-800">{item.ei}</td>
                {!isPrintView && (
                  <td className="border border-black p-2 text-[10px] text-gray-500 leading-tight print:hidden">
                    {item.teacherName || '-'}<br/>({getDisplayDate(item)})
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderReadOnlyRatioTable = () => {
    const currentStatusRatios = assessmentRatios.filter(r => String(r.year) === String(vRatioYear) && String(r.semester) === String(vRatioSem));
    let displayStatusRatios = [];

    if (String(vRatioYear) === '2026' && String(vRatioSem) === '1') {
      displayStatusRatios = defaultAssessment2026S1.map(def => {
        const found = currentStatusRatios.find(r => r.subject === def.subject && String(r.grade) === String(def.grade));
        return found ? found : { ...def, year: '2026', semester: '1' };
      });
      currentStatusRatios.forEach(r => {
        if (!displayStatusRatios.find(d => d.subject === r.subject && String(d.grade) === String(r.grade))) displayStatusRatios.push(r);
      });
    } else {
      displayStatusRatios = [...currentStatusRatios];
    }

    if (displayStatusRatios.length === 0) {
      return <div className="p-8 text-center text-gray-500 font-bold bg-gray-50 rounded-2xl">해당 학기({vRatioYear}년 {vRatioSem}학기)에 입력된 평가 비율 데이터가 없습니다.</div>;
    }

    return (
      <div className="w-full">
        {[1, 2, 3].map(g => {
          const gradeRatios = displayStatusRatios.filter(r => String(r.grade) === String(g));
          if (gradeRatios.length === 0) return null;
          return (
            <div key={g} className="mb-8">
              <h3 className="text-xl font-black text-gray-800 mb-3 border-l-4 border-emerald-500 pl-3 print:border-none print:pl-0">{g}학년</h3>
              <div className="w-full overflow-x-auto bg-white rounded-2xl shadow-sm border border-gray-200 print:shadow-none print:border-none print:overflow-visible">
                <table className="w-full border-collapse border-2 border-black text-center text-[13px] print:text-[10px] print:w-full table-fixed">
                  <thead>
                    <tr>
                      <th rowSpan={2} className="border-2 border-black p-1 bg-gray-100 font-black w-36">과목(학점)</th>
                      <th colSpan={2} className="border-2 border-black p-1 bg-gray-100 font-black text-xs">정기시험(%)</th>
                      <th colSpan={5} className="border-2 border-black p-1 bg-gray-100 font-black text-xs">수행평가(차)</th>
                      <th rowSpan={2} className="border-2 border-black p-1 bg-gray-100 font-black w-14 text-[10px]">논술형<br/>비율(%)</th>
                      <th rowSpan={2} className="border-2 border-black p-1 bg-gray-100 font-black w-12 text-[10px]">계<br/>(100%)</th>
                      <th rowSpan={2} className="border-2 border-black p-1 bg-gray-100 font-black w-24 print:w-20">최종 확인</th>
                    </tr>
                    <tr>
                      <th className="border-2 border-black p-1 bg-gray-50 text-[10px] font-bold w-14">1차</th>
                      <th className="border-2 border-black p-1 bg-gray-50 text-[10px] font-bold w-14">2차</th>
                      <th className="border-2 border-black p-1 bg-gray-50 text-[10px] font-bold w-12">(1)</th>
                      <th className="border-2 border-black p-1 bg-gray-50 text-[10px] font-bold w-12">(2)</th>
                      <th className="border-2 border-black p-1 bg-gray-50 text-[10px] font-bold w-12">(3)</th>
                      <th className="border-2 border-black p-1 bg-gray-50 text-[10px] font-bold w-12">(4)</th>
                      <th className="border-2 border-black p-1 bg-gray-50 text-[10px] font-bold w-12">(5)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gradeRatios.map(item => (
                      <tr key={item.id || item.subject}>
                        <td className="border border-black p-1 font-bold text-left pl-2">{item.subject}</td>
                        <td className="border border-black p-1">{item.exam1}</td>
                        <td className="border border-black p-1">{item.exam2}</td>
                        <td className="border border-black p-1">{item.perf1}</td>
                        <td className="border border-black p-1">{item.perf2}</td>
                        <td className="border border-black p-1">{item.perf3}</td>
                        <td className="border border-black p-1">{item.perf4}</td>
                        <td className="border border-black p-1">{item.perf5}</td>
                        <td className="border border-black p-1 font-bold">{item.essay}</td>
                        <td className="border border-black p-1">{item.total}</td>
                        <td className="border border-black p-1">
                          {item.isConfirmed ? <span className="text-[10px] font-black text-emerald-700">{item.confirmedBy} (완료)</span> : <span className="text-[10px] text-gray-400">미확인</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="app-root min-h-screen flex flex-col bg-gray-100 selection:bg-blue-100 font-sans">
      <style>{printStyles}</style>
      
      {/* 팝업 모달 */}
      {selectedSubmission && selectedSubmission.length > 0 && (() => {
        const baseSub = selectedSubmission[0]; 
        return (
          <div className="print-document-modal fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 md:p-8 print:static print:block print:bg-white print:p-0 animate-fade-in overflow-y-auto" onClick={() => setSelectedSubmission(null)}>
            <div className="print-document-sheet bg-white p-10 md:p-14 rounded-none md:rounded-[2rem] max-w-4xl w-full shadow-2xl print:shadow-none print:max-w-none print:w-full print:p-0 my-auto" onClick={e => e.stopPropagation()}>
              <div className="print-document-content print:text-black">
                <h2 className="text-3xl font-black text-center mb-1 tracking-[0.2em]">{baseSub.year === 'undefined' ? '?' : baseSub.year}년 {baseSub.semester === 'undefined' ? '?' : baseSub.semester}학기 {baseSub.examName === 'undefined' ? '' : baseSub.examName}</h2>
                <h2 className="text-3xl font-black text-center mb-8 tracking-[0.2em]">출제 검토 확인서</h2>
                <p className="text-lg font-bold leading-relaxed mb-4 text-justify">본인은 {baseSub.subject}과 시험문제를 출제함에 있어 아래 표와 같은 내용을 검토하였음을 확인합니다.</p>
                <table className="w-full border-collapse border-2 border-black mb-10 text-[15px] print:text-[14px]">
                  <thead><tr><th className="border-2 border-black p-3 bg-gray-100 font-black text-center" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>검토 사항</th><th className="border-2 border-black p-3 bg-gray-100 font-black text-center w-28 whitespace-nowrap" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>확인여부<br/>(O, X)</th></tr></thead>
                  <tbody>
                    {(baseSub.checklistSnapshot || defaultChecklistData).map(item => (
                      <tr key={item.id}>
                        {item.type === 'category' ? ( <><td className="border border-black px-4 py-3 font-bold bg-gray-50 print:bg-gray-50" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>{item.text}</td><td className="border border-black px-4 py-3 bg-gray-50 print:bg-gray-50" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}></td></>) : ( <><td className={`border border-black px-4 py-2 leading-snug ${item.type === 'item2' ? 'pl-8' : 'pl-4'}`}>{item.text}</td><td className="border border-black p-2 text-center font-black text-xl">{item.status}</td></>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="print-signature-area text-center mt-12 print:mt-16">
                  <p className="text-lg font-bold mb-6">위 항목을 모두 확인하고 이상 없음을 확인합니다.</p><p className="text-xl font-bold tracking-widest mb-10">{activeSig.documentDate}</p>
                  <div className={`print-signature-list signature-count-${Math.min(selectedSubmission.length, 6)} flex flex-col items-end text-xl font-bold pr-4 gap-y-6 mt-4`}>
                    {selectedSubmission.map((sub, idx) => (
                      <div key={idx} className="print-signature-row flex items-center">
                        <span className={`mr-8 ${idx === 0 ? '' : 'invisible'}`}>확인 직위: 교사</span><span className="mr-2 w-32 text-right">성명: {sub.teacherName}</span>
                        <div className="relative inline-flex items-center justify-center w-28 h-12 ml-2"><span className="z-0 text-gray-400 font-normal">(서명/인)</span><img src={sub.signatureData} alt="서명" className="absolute z-10 h-16 w-[140%] max-w-none object-contain mix-blend-multiply drop-shadow-sm pointer-events-none" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} /></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-4 mt-16 pt-8 border-t border-gray-200 print:hidden">
                <button onClick={() => window.print()} className="flex-1 py-4 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 text-lg shadow-lg active:scale-95"><Printer size={22}/> 인쇄 및 PDF로 백업 저장</button>
                <button onClick={() => setSelectedSubmission(null)} className="flex-1 py-4 bg-gray-900 text-white font-black rounded-xl hover:bg-black transition-all flex items-center justify-center gap-2 text-lg active:scale-95"><X size={22}/> 닫기</button>
              </div>
            </div>
          </div>
        );
      })()}

      {selectedScheduleItem && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in print:hidden" onClick={() => setSelectedScheduleItem(null)}>
          <div className="bg-white p-8 rounded-[2rem] max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h2 className="text-xl font-black text-gray-800 flex items-center gap-2"><Edit2 className="text-blue-500" size={24}/> 시험 범위 입력</h2>
              <button onClick={() => setSelectedScheduleItem(null)} className="text-gray-400 hover:text-red-500"><X size={24}/></button>
            </div>
            <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-sm font-bold text-blue-900">{selectedScheduleItem.date} {selectedScheduleItem.grade}학년 {selectedScheduleItem.period}교시</p>
              <p className="text-lg font-black text-blue-700">{selectedScheduleItem.subject}</p>
            </div>
            <form onSubmit={handleScopeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-500 mb-2">시험 범위 내용</label>
                <textarea value={scopeInputText} onChange={e => setScopeInputText(e.target.value)} className="w-full h-32 p-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 resize-none" placeholder="예: 교과서 p.12 ~ p.56, 학습지 1~3회차" />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-500 mb-2">작성자(수정자) 성함</label>
                <input type="text" value={scopeInputTeacher} onChange={e => setScopeInputTeacher(e.target.value)} className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm font-bold outline-none focus:border-blue-500" placeholder="홍길동 (선택 입력)" />
              </div>
              <button type="submit" disabled={isSaving} className="w-full py-4 mt-2 bg-gray-900 text-white rounded-xl font-black shadow-md hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-2">
                {isSaving ? '저장 중...' : <><Save size={18}/> 시험 범위 저장하기</>}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className={`${selectedSubmission || selectedScheduleItem ? 'print:hidden' : ''} flex flex-col flex-1`}>
        <header className="bg-white/90 backdrop-blur-md sticky top-0 z-10 border-b border-gray-200 px-3 sm:px-6 py-3 flex flex-col xl:flex-row justify-between items-center shadow-sm gap-3 print:hidden">
          <button type="button" onClick={() => setViewMode('home')} className="flex items-center gap-2 sm:gap-3 text-left hover:opacity-90 transition-opacity" title="첫 화면으로 이동">
            <div className="bg-blue-600 p-1.5 sm:p-2 rounded-xl shadow-lg shadow-blue-200"><FileText className="text-white w-4 h-4 sm:w-5 sm:h-5"/></div>
            <h1 className="text-base sm:text-xl font-black text-gray-800 tracking-tight whitespace-nowrap">백송고 정기고사</h1>
          </button>
          
          <div className="flex flex-wrap bg-gray-200/50 p-1 rounded-xl sm:rounded-2xl border border-gray-200 justify-center">
            <button onClick={() => setViewMode('home')} className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black transition-all duration-200 flex items-center gap-1 ${viewMode==='home'?'bg-white text-gray-800 shadow-md transform scale-105':'text-gray-500 hover:text-gray-700'}`}><Home size={12}/>홈</button>
            <button onClick={() => setViewMode('ratio')} className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black transition-all duration-200 flex items-center gap-1 ${viewMode==='ratio'?'bg-white text-amber-600 shadow-md transform scale-105':'text-gray-500 hover:text-gray-700'}`}><ClipboardList size={12}/>시험 및 수행 비율</button>
            <button onClick={() => setViewMode('teacher')} className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black transition-all duration-200 flex items-center gap-1 ${viewMode==='teacher'?'bg-white text-blue-600 shadow-md transform scale-105':'text-gray-500 hover:text-gray-700'}`}><Edit2 size={12}/>출제 서명</button>
            <button onClick={() => setViewMode('scope')} className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black transition-all duration-200 flex items-center gap-1 ${viewMode==='scope'?'bg-white text-indigo-600 shadow-md transform scale-105':'text-gray-500 hover:text-gray-700'}`}><CalendarDays size={12}/>시험 범위</button>
            <button onClick={() => setViewMode('cutoff')} className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black transition-all duration-200 flex items-center gap-1 ${viewMode==='cutoff'?'bg-white text-rose-600 shadow-md transform scale-105':'text-gray-500 hover:text-gray-700'}`}><Target size={12}/>추정분할</button>
            <button onClick={() => {setViewMode('status'); setStatusTab('signature');}} className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black transition-all duration-200 flex items-center gap-1 ${viewMode==='status'?'bg-white text-emerald-600 shadow-md transform scale-105':'text-gray-500 hover:text-gray-700'}`}><BarChart3 size={12}/>제출 현황</button>
            <button onClick={() => setViewMode('admin')} className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black transition-all duration-200 flex items-center gap-1 ${viewMode==='admin'?'bg-white text-purple-600 shadow-md transform scale-105':'text-gray-500 hover:text-gray-700'}`}><Settings size={12}/>관리자</button>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-start p-4 md:p-8 animate-fade-in relative z-0 print:p-0 w-full">
          
          {/* 홈 화면 */}
          {viewMode === 'home' && (
            <div className="w-full max-w-6xl mt-2 sm:mt-8 animate-fade-in flex flex-col items-center px-2">
              <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white p-6 md:p-10 mb-8 text-center w-full">
                <h2 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight mb-3">정기고사 평가자료 관리</h2>
                <p className="text-gray-500 text-sm md:text-base font-medium leading-relaxed">
                  선생님, 환영합니다. 원하시는 업무를 선택하여 진행해 주세요.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                <button onClick={() => setViewMode('ratio')} className="group bg-white rounded-[2rem] p-6 border-2 border-amber-50 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-amber-400 transition-all text-left relative overflow-hidden flex flex-col h-full">
                  <div className="absolute right-0 top-0 w-28 h-28 bg-amber-50/50 rounded-bl-full group-hover:bg-amber-100 transition-colors" />
                  <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center mb-3 relative z-10 shadow-md shadow-amber-200"><ClipboardList size={22}/></div>
                  <h3 className="text-lg font-black text-gray-900 mb-2 relative z-10">시험 및 수행 비율</h3>
                  <p className="text-xs text-gray-500 mb-5 flex-1 relative z-10">과목별 정기시험 및 수행평가 비율을 관리하고 최종 확인합니다.</p>
                  <div className="w-full py-2.5 bg-amber-50 text-amber-700 rounded-xl font-bold text-center text-sm group-hover:bg-amber-600 group-hover:text-white transition-colors relative z-10">비율 관리</div>
                </button>

                <button onClick={() => setViewMode('teacher')} className="group bg-white rounded-[2rem] p-6 border-2 border-blue-50 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-blue-400 transition-all text-left relative overflow-hidden flex flex-col h-full">
                  <div className="absolute right-0 top-0 w-28 h-28 bg-blue-50/50 rounded-bl-full group-hover:bg-blue-100 transition-colors" />
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-3 relative z-10 shadow-md shadow-blue-200"><Edit2 size={22}/></div>
                  <h3 className="text-lg font-black text-gray-900 mb-2 relative z-10">출제 서명</h3>
                  <p className="text-xs text-gray-500 mb-5 flex-1 relative z-10">검토 확인서 내용을 숙지한 뒤 서명합니다.</p>
                  <div className="w-full py-2.5 bg-blue-50 text-blue-700 rounded-xl font-bold text-center text-sm group-hover:bg-blue-600 group-hover:text-white transition-colors relative z-10">서명하기</div>
                </button>

                <button onClick={() => setViewMode('scope')} className="group bg-white rounded-[2rem] p-6 border-2 border-indigo-50 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-indigo-400 transition-all text-left relative overflow-hidden flex flex-col h-full">
                  <div className="absolute right-0 top-0 w-28 h-28 bg-indigo-50/50 rounded-bl-full group-hover:bg-indigo-100 transition-colors" />
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-3 relative z-10 shadow-md shadow-indigo-200"><CalendarDays size={22}/></div>
                  <h3 className="text-lg font-black text-gray-900 mb-2 relative z-10">시험 범위 입력</h3>
                  <p className="text-xs text-gray-500 mb-5 flex-1 relative z-10">담당 과목의 시험 범위를 작성합니다.</p>
                  <div className="w-full py-2.5 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-center text-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors relative z-10">범위 입력</div>
                </button>

                <button onClick={() => setViewMode('cutoff')} className="group bg-white rounded-[2rem] p-6 border-2 border-rose-50 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-rose-400 transition-all text-left relative overflow-hidden flex flex-col h-full">
                  <div className="absolute right-0 top-0 w-28 h-28 bg-rose-50/50 rounded-bl-full group-hover:bg-rose-100 transition-colors" />
                  <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center mb-3 relative z-10 shadow-md shadow-rose-200"><Target size={22}/></div>
                  <h3 className="text-lg font-black text-gray-900 mb-2 relative z-10">추정분할 점수</h3>
                  <p className="text-xs text-gray-500 mb-5 flex-1 relative z-10">해당 과목만 A~E 분할점수를 입력합니다.</p>
                  <div className="w-full py-2.5 bg-rose-50 text-rose-700 rounded-xl font-bold text-center text-sm group-hover:bg-rose-600 group-hover:text-white transition-colors relative z-10">점수 입력</div>
                </button>
              </div>
            </div>
          )}

          {/* 평가 비율 입력 화면 */}
          {viewMode === 'ratio' && (
            <div className="w-full max-w-[1200px] bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white p-6 md:p-10 animate-fade-in mt-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-gray-100 pb-6">
                <div className="flex flex-col gap-2">
                  <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2"><ClipboardList className="text-amber-600"/> 과목별 정기시험 및 수행평가 비율</h2>
                  <p className="text-gray-500 text-sm font-medium">비율을 입력하면 <strong>논술형(괄호 안 합)</strong>과 <strong>계(괄호 밖 합)</strong>가 자동 계산되며, 빈칸 클릭 시 바로 수정할 수 있습니다.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 p-1 rounded-xl px-3">
                    <History size={16} className="text-gray-400"/>
                    <input type="text" value={ratioYear} onChange={e=>setRatioYear(e.target.value)} className="w-16 bg-transparent text-sm font-bold text-center outline-none" />년
                    <select value={ratioSem} onChange={e=>setRatioSem(e.target.value)} className="bg-transparent text-sm font-bold outline-none ml-2">
                      <option value="1">1학기</option>
                      <option value="2">2학기</option>
                    </select>
                  </div>
                </div>
              </div>

              {ratioYear === '2026' && ratioSem === '1' && currentRatios.length === 0 && displayRatios.length === 0 && (
                <div className="mb-6 p-6 bg-amber-50 border border-amber-200 rounded-2xl text-center print:hidden">
                  <p className="text-amber-800 font-bold mb-3">2026학년도 1학기 데이터가 아직 없습니다.</p>
                  <button onClick={() => {}} className="bg-amber-600 text-white px-6 py-2.5 rounded-xl font-black shadow-md hover:bg-amber-700 active:scale-95 transition-all">
                    초기 데이터는 자동으로 복원됩니다.
                  </button>
                </div>
              )}

              <div className="w-full">
                {[1, 2, 3].map(g => {
                  const gradeRatios = displayRatios.filter(r => String(r.grade) === String(g));
                  const newRows = newRatioRows.filter(r => String(r.grade) === String(g) && String(r.year) === String(ratioYear) && String(r.semester) === String(ratioSem));
                  
                  if (gradeRatios.length === 0 && newRows.length === 0) {
                    return (
                      <div key={g} className="mb-8">
                        <h3 className="text-xl font-black text-gray-800 mb-3 border-l-4 border-amber-500 pl-3">{g}학년</h3>
                        <div className="text-center py-6 bg-gray-50 rounded-2xl text-gray-400 font-bold text-sm">데이터가 없습니다. 아래 버튼으로 과목을 추가하세요.</div>
                        <div className="mt-3 text-right">
                          <button onClick={() => setNewRatioRows([...newRatioRows, { id: `new_${g}_${Date.now()}_${Math.floor(Math.random()*1000)}`, year: ratioYear, semester: ratioSem, grade: g, isConfirmed: false }])} className="text-xs bg-gray-800 text-white px-3 py-1.5 rounded-lg hover:bg-black font-bold flex items-center gap-1 inline-flex"><Plus size={14}/> {g}학년 과목 추가</button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={g} className="mb-8 animate-fade-in">
                      <h3 className="text-xl font-black text-gray-800 mb-3 border-l-4 border-amber-500 pl-3">{g}학년</h3>
                      <div className="w-full overflow-x-auto bg-white shadow-sm border border-gray-200">
                        <table className="w-full border-collapse border border-gray-300 text-center text-[12px] table-fixed min-w-[800px]">
                          <thead>
                            <tr>
                              <th rowSpan={2} className="border border-gray-300 p-1 bg-gray-100 font-black w-[15%]">과목(학점)</th>
                              <th colSpan={2} className="border border-gray-300 p-1 bg-gray-100 font-black w-[16%] text-xs">정기시험(%)</th>
                              <th colSpan={5} className="border border-gray-300 p-1 bg-gray-100 font-black w-[35%] text-xs">수행평가(차)</th>
                              <th rowSpan={2} className="border border-gray-300 p-1 bg-gray-100 font-black w-[7%] text-[10px] leading-tight">논술형<br/>비율(%)</th>
                              <th rowSpan={2} className="border border-gray-300 p-1 bg-gray-100 font-black w-[7%] text-[10px] leading-tight">계<br/>(100%)</th>
                              <th rowSpan={2} className="border border-gray-300 p-1 bg-gray-100 font-black w-[12%] text-[10px]">최종 확인</th>
                              <th rowSpan={2} className="border border-gray-300 p-1 bg-gray-100 font-black w-[8%] text-[10px]">관리</th>
                            </tr>
                            <tr>
                              <th className="border border-gray-300 p-1 bg-gray-50 text-[10px] font-bold">1차</th>
                              <th className="border border-gray-300 p-1 bg-gray-50 text-[10px] font-bold">2차</th>
                              <th className="border border-gray-300 p-1 bg-gray-50 text-[10px] font-bold">(1)</th>
                              <th className="border border-gray-300 p-1 bg-gray-50 text-[10px] font-bold">(2)</th>
                              <th className="border border-gray-300 p-1 bg-gray-50 text-[10px] font-bold">(3)</th>
                              <th className="border border-gray-300 p-1 bg-gray-50 text-[10px] font-bold">(4)</th>
                              <th className="border border-gray-300 p-1 bg-gray-50 text-[10px] font-bold">(5)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {gradeRatios.map(item => <RatioRow key={item.id} item={item} year={ratioYear} sem={ratioSem} grade={g} onSave={handleRatioSave} onDelete={handleRatioDelete} />)}
                            {newRows.map(item => <RatioRow key={item.id} item={item} year={ratioYear} sem={ratioSem} grade={g} onSave={handleRatioSave} onDelete={handleRatioDelete} />)}
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-3 text-right">
                        <button onClick={() => setNewRatioRows([...newRatioRows, { id: `new_${g}_${Date.now()}_${Math.floor(Math.random()*1000)}`, year: ratioYear, semester: ratioSem, grade: g, isConfirmed: false }])} className="text-xs bg-gray-800 text-white px-3 py-1.5 rounded-lg hover:bg-black font-bold flex items-center gap-1 inline-flex">
                          <Plus size={14}/> {g}학년 과목 추가
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 교사 서명 화면 */}
          {viewMode === 'teacher' && (
            <div className="w-full max-w-md bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden border border-white relative mt-4">
              <div className="px-6 pt-5 pb-0 print:hidden">
                <button type="button" onClick={() => setViewMode('home')} className="text-xs font-black text-gray-500 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 px-3 py-2 rounded-xl transition-all">← 첫 화면으로</button>
              </div>
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-8 text-center relative overflow-hidden mt-4">
                <h2 className="text-2xl font-black mb-1 relative z-10">{String(activeSig.year)}년 {String(activeSig.semester)}학기 {String(activeSig.examName)}</h2>
                <h2 className="text-2xl font-black relative z-10">출제 검토 확인서</h2>
              </div>
              
              {saveSuccess ? (
                <div className="p-20 text-center animate-fade-in">
                  <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner"><Check className="text-green-600" size={48} strokeWidth={3}/></div>
                  <h3 className="text-2xl font-black text-gray-800">제출 완료!</h3>
                  <p className="text-gray-500 mt-3 text-sm font-medium">안전하게 보존되었습니다.</p>
                  <div className="mt-8 space-y-2">
                    <button type="button" onClick={() => setViewMode('home')} className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-black hover:bg-black transition-all">첫 화면으로 이동</button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleTeacherSubmit} className="p-8 space-y-6">
                  <div className="border border-gray-200 rounded-2xl h-64 flex flex-col bg-white overflow-hidden shadow-sm">
                    <div className="bg-blue-50/50 p-3 border-b border-gray-200 shrink-0 z-10"><p className="text-xs font-black text-blue-700 text-center">관리자가 확인한 항목을 숙지했습니다.</p></div>
                    <div className="p-4 overflow-y-auto custom-scrollbar flex-1 bg-gray-50">
                      <ul className="space-y-3 text-sm text-gray-600">
                        {(globalSettings.checklist || defaultChecklistData).map(item => (
                          <li key={item.id} className={`flex justify-between items-start ${item.type === 'category' ? 'font-black text-gray-800 mt-5 border-b border-gray-200 pb-1 text-base' : 'pl-2 mt-2'}`}>
                            <span className={item.type === 'category' ? '' : 'relative before:content-["-"] before:absolute before:-left-2 before:text-gray-400 pl-2 pr-4 flex-1 leading-tight'}>{item.text}</span>
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
                      <select value={selectedSubject} onChange={e=>{ setSelectedSubject(e.target.value); setSelectedTeacher(''); setSignatureData(null); setDeleteStep(0); setSubmitError(''); }} className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-base font-bold focus:border-blue-500 focus:bg-white transition-all appearance-none outline-none shadow-sm" required>
                        <option value="">과목 선택</option>
                        {Array.isArray(globalSettings.subjects) && globalSettings.subjects.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                      </select>
                      <div className="absolute right-4 bottom-4 pointer-events-none opacity-30"><Search size={18}/></div>
                    </div>

                    {selectedSubject && safeTeachers.length > 0 && (
                      <div className="animate-fade-in relative group">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 mb-1">Teacher</label>
                        <select value={selectedTeacher} onChange={e => { setSelectedTeacher(e.target.value); setSignatureData(null); setDeleteStep(0); setSubmitError(''); }} className="w-full p-4 bg-blue-50/50 border-2 border-blue-100 rounded-2xl text-base font-bold text-blue-800 focus:border-blue-500 focus:bg-white transition-all appearance-none outline-none shadow-sm" required>
                          <option value="">성함 선택</option>
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
                          <button type="button" onClick={() => { if (deleteStep === 0) setDeleteStep(1); else confirmDeleteSignature(existingSigForSelectedTeacher.id); }} className={`w-full py-3.5 font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 ${deleteStep === 0 ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50' : 'bg-red-500 text-white hover:bg-red-600 animate-pulse'}`}>
                            <Trash2 size={16}/>{deleteStep === 0 ? '재서명 (삭제)' : '정말 삭제하시겠습니까?'}
                          </button>
                        </div>
                      ) : (
                        <div className="animate-fade-in space-y-3 pt-2">
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Signature</label>
                          <SignaturePad onSave={setSignatureData} resetTrigger={resetSigCounter} />
                          <button type="submit" disabled={isSaving || !signatureData} className="w-full py-5 bg-gray-900 text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-gray-200 hover:bg-black transition-all active:scale-95 disabled:bg-gray-300 flex items-center justify-center gap-2 mt-4">
                            {isSaving ? '보존 중...' : <><Save size={20}/> 확인 및 제출</>}
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

          {/* 시험 범위 입력 화면 */}
          {viewMode === 'scope' && (
            <div className="w-full max-w-5xl animate-fade-in mt-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 px-2">
                <div>
                  <button type="button" onClick={() => setViewMode('home')} className="mb-3 text-xs font-black text-gray-500 hover:text-indigo-600 bg-white hover:bg-indigo-50 border border-gray-200 hover:border-indigo-200 px-3 py-2 rounded-xl transition-all shadow-sm">← 첫 화면으로</button>
                  <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2"><CalendarDays className="text-indigo-600"/> {activeScope.year}년 {activeScope.semester}학기 {activeScope.examName} 범위 입력</h2>
                  <p className="text-gray-500 text-sm font-medium mt-1">담당 과목의 [입력/수정] 버튼을 눌러주세요.</p>
                </div>
              </div>
              {renderScheduleTable(false)}
            </div>
          )}

          {/* 추정분할 점수 입력 화면 */}
          {viewMode === 'cutoff' && (
            <div className="w-full max-w-md bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden border border-white relative mt-4">
              <div className="px-6 pt-5 pb-0 print:hidden">
                <button type="button" onClick={() => setViewMode('home')} className="text-xs font-black text-gray-500 hover:text-rose-600 bg-gray-50 hover:bg-rose-50 border border-gray-200 hover:border-rose-200 px-3 py-2 rounded-xl transition-all">← 첫 화면으로</button>
              </div>
              <div className="bg-gradient-to-br from-rose-600 to-rose-800 text-white p-8 text-center relative overflow-hidden mt-4">
                <h2 className="text-2xl font-black mb-1 relative z-10 flex justify-center items-center gap-2 tracking-wide"><Target size={24}/> {activeCutoff.year}년 {activeCutoff.semester}학기 추정분할 점수 입력</h2>
                <p className="text-rose-100 text-sm font-medium opacity-90 relative z-10 mt-1">추정분할 하는 과목만 입력해 주세요.</p>
              </div>
              <form onSubmit={handleCutoffSubmit} className="p-8 space-y-5">
                <div className="relative group">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 mb-1">Exam Type (고사 종류)</label>
                  <select value={localCutoffExam} onChange={e=>{setLocalCutoffExam(e.target.value); setCutoffSubjectGrade('');}} className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-base font-bold focus:border-rose-500 focus:bg-white transition-all appearance-none outline-none shadow-sm" required>
                    <option value="1차 정기시험">1차 정기시험</option><option value="2차 정기시험">2차 정기시험</option><option value="수행평가">수행평가</option>
                  </select>
                </div>
                <div className="relative group">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 mb-1">Subject (과목 선택)</label>
                  <select value={cutoffSubjectGrade} onChange={e=>setCutoffSubjectGrade(e.target.value)} className="w-full p-4 bg-rose-50/50 border-2 border-rose-100 rounded-2xl text-base font-bold text-rose-900 focus:border-rose-500 focus:bg-white transition-all appearance-none outline-none shadow-sm" required>
                    <option value="">과목명 (학년)을 선택하세요</option>
                    {cutoffSubjectOptions.map((item, idx) => (
                      <option key={idx} value={`${item.grade}|${item.subject}`}>{item.subject} ({item.grade}학년)</option>
                    ))}
                  </select>
                  {cutoffSubjectOptions.length === 0 && <p className="text-xs text-red-500 mt-2 font-bold px-2">해당 고사에 등록된 과목이나 시간표가 없습니다. 관리자 메뉴에서 세팅해주세요.</p>}
                </div>
                
                {cutoffSubjectGrade && (
                  <div className="animate-fade-in space-y-4 pt-2 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="block text-xs font-black text-gray-500 mb-1 ml-1">A / B</label><input type="number" step="0.01" value={cutoffScores.ab} onChange={e=>setCutoffScores({...cutoffScores, ab: e.target.value})} className="w-full p-3 bg-rose-50 border-2 border-rose-100 rounded-xl text-center font-bold focus:border-rose-500 outline-none" placeholder="예: 81.61"/></div>
                      <div><label className="block text-xs font-black text-gray-500 mb-1 ml-1">B / C</label><input type="number" step="0.01" value={cutoffScores.bc} onChange={e=>setCutoffScores({...cutoffScores, bc: e.target.value})} className="w-full p-3 bg-rose-50 border-2 border-rose-100 rounded-xl text-center font-bold focus:border-rose-500 outline-none" placeholder="예: 66.61"/></div>
                      <div><label className="block text-xs font-black text-gray-500 mb-1 ml-1">C / D</label><input type="number" step="0.01" value={cutoffScores.cd} onChange={e=>setCutoffScores({...cutoffScores, cd: e.target.value})} className="w-full p-3 bg-rose-50 border-2 border-rose-100 rounded-xl text-center font-bold focus:border-rose-500 outline-none" placeholder="예: 51.61"/></div>
                      <div><label className="block text-xs font-black text-gray-500 mb-1 ml-1">D / E</label><input type="number" step="0.01" value={cutoffScores.de} onChange={e=>setCutoffScores({...cutoffScores, de: e.target.value})} className="w-full p-3 bg-rose-50 border-2 border-rose-100 rounded-xl text-center font-bold focus:border-rose-500 outline-none" placeholder="예: 36.61"/></div>
                      <div className="col-span-2"><label className="block text-xs font-black text-gray-500 mb-1 ml-1">E / I (또는 미만)</label><input type="number" step="0.01" value={cutoffScores.ei} onChange={e=>setCutoffScores({...cutoffScores, ei: e.target.value})} className="w-full p-3 bg-rose-50 border-2 border-rose-100 rounded-xl text-center font-bold focus:border-rose-500 outline-none" placeholder="예: 19.95"/></div>
                    </div>
                    <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 mb-1 mt-2">Teacher (성함)</label><input type="text" value={cutoffTeacher} onChange={e=>setCutoffTeacher(e.target.value)} className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm font-bold focus:border-rose-500 outline-none" placeholder="입력자 성함 (필수 입력)" required/></div>
                    <button type="submit" disabled={isSaving} className="w-full py-4 mt-2 bg-gray-900 text-white rounded-xl font-black shadow-md hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-2">
                      {isSaving ? '저장 중...' : <><Save size={18}/> 점수 저장하기</>}
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* 💡 관리자 제출 현황 화면 (비율 및 수행 현황 통합) */}
          {viewMode === 'status' && (
            <div className="print-status-page w-full max-w-5xl bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white p-6 md:p-10 animate-fade-in mt-4 print:shadow-none print:p-0 print:mt-0 print:border-none print:bg-transparent">
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-gray-100 pb-6 print:hidden">
                <div className="flex flex-col gap-4 w-full md:w-auto">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-100 p-3 rounded-2xl"><BarChart3 className="text-emerald-600" size={24}/></div>
                    <div><h2 className="text-2xl font-black text-gray-800">문서 출력 및 제출 현황</h2><p className="text-gray-500 text-sm font-medium">진행 상황을 확인하고 인쇄합니다.</p></div>
                  </div>
                  <div className="flex bg-gray-100 p-1 rounded-xl self-start overflow-x-auto max-w-full no-scrollbar">
                    <button onClick={() => setStatusTab('ratio')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${statusTab === 'ratio' ? 'bg-white text-amber-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>비율 현황</button>
                    <button onClick={() => setStatusTab('signature')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${statusTab === 'signature' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>서명 현황</button>
                    <button onClick={() => setStatusTab('scope')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${statusTab === 'scope' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>시험 범위표</button>
                    <button onClick={() => setStatusTab('cutoff')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${statusTab === 'cutoff' ? 'bg-white text-rose-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>분할 점수표</button>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 self-end md:self-center">
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 p-1 rounded-xl">
                    <History size={16} className="text-gray-400 ml-2"/>
                    {statusTab === 'ratio' ? (
                      <select value={viewingRatioKey} onChange={(e) => setViewingRatioKey(e.target.value)} className="bg-transparent p-2 text-sm font-bold text-gray-700 outline-none pr-4">
                        {ratioOptions.map(opt => <option key={opt} value={opt}>{formatRatioOption(opt)}</option>)}
                      </select>
                    ) : (
                      <select value={viewingExamKey} onChange={(e) => setViewingExamKey(e.target.value)} className="bg-transparent p-2 text-sm font-bold text-gray-700 outline-none pr-4">
                        {examOptions.map(opt => <option key={opt} value={opt}>{formatExamOption(opt)}</option>)}
                      </select>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {statusTab === 'ratio' && <button onClick={handleExportRatioCSV} className="bg-amber-50 text-amber-700 px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold hover:bg-amber-100 border border-amber-200"><Download size={16} /> 엑셀</button>}
                    {statusTab === 'signature' && <button onClick={handleExportCSV} className="bg-emerald-50 text-emerald-700 px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold hover:bg-emerald-100 border border-emerald-200"><Download size={16} /> 엑셀</button>}
                    {statusTab === 'scope' && <button onClick={handleExportScopeCSV} className="bg-indigo-50 text-indigo-700 px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold hover:bg-indigo-100 border border-indigo-200"><Download size={16} /> 엑셀</button>}
                    {statusTab === 'cutoff' && <button onClick={handleExportCutoffCSV} className="bg-rose-50 text-rose-700 px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold hover:bg-rose-100 border border-rose-200"><Download size={16} /> 엑셀</button>}
                    <button onClick={() => window.print()} className="bg-gray-800 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold hover:bg-black transition-colors shadow-md whitespace-nowrap"><Printer size={16} /> 인쇄하기</button>
                  </div>
                </div>
              </div>

              {/* 💡 비율 읽기 전용 모드 렌더링 (제출 현황) */}
              {statusTab === 'ratio' && (
                <div className="animate-fade-in print:block">
                  <div className="mb-6 text-center text-lg font-black text-amber-800 bg-amber-50 py-3 rounded-xl print:bg-transparent print:p-0 border-b-2 print:border-black print:pb-4 print:hidden">
                    [시험 및 수행 비율 현황] {vRatioYear}학년도 {vRatioSem}학기
                  </div>
                  <div className="text-center mb-6 print:mb-8 hidden print:block"><h2 className="text-2xl font-black tracking-widest">{vRatioYear}학년도 {vRatioSem}학기 과목별 정기시험 및 수행평가 비율</h2></div>
                  {renderReadOnlyRatioTable()}
                </div>
              )}

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
                      const printRecord = printStatuses.find(p => p.year === vYear && p.semester === vSem && p.examName === vExam && p.subjectName === subject.name);

                      return (
                        <div key={subject.name} className={`relative p-6 rounded-3xl border-2 transition-all shadow-sm print:break-inside-avoid ${isComplete ? 'bg-emerald-50/50 border-emerald-100 print:border-gray-300 print:bg-white' : 'bg-white border-gray-200 print:border-gray-300'}`}>
                          <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2 print:border-gray-200">
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-black text-gray-800">{subject.name}</h3>
                              {subjectSignatures.length > 0 && (
                                <button onClick={() => { const sortedSigs = [...subjectSignatures].sort((a, b) => a.teacherName.localeCompare(b.teacherName, 'ko-KR')); setSelectedSubmission(sortedSigs); }} className="print:hidden text-[11px] bg-blue-100 text-blue-700 px-2 py-1 rounded-md font-bold hover:bg-blue-200 flex items-center gap-1 transition-colors">
                                  <Printer size={12}/> 통합인쇄
                                </button>
                              )}
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-black ${isComplete ? 'bg-emerald-100 text-emerald-700 print:bg-gray-100 print:text-gray-800' : 'bg-gray-100 text-gray-600'}`}>{submittedCount} / {totalCount} 명</div>
                          </div>
                          <div className="flex flex-col gap-2 mt-4">
                            {(subject.teachers || []).length === 0 ? (
                              <span className="text-xs text-gray-400">등록된 교사가 없습니다.</span>
                            ) : (
                              (subject.teachers || []).map(teacher => {
                                const sigRecord = subjectSignatures.find(s => s.teacherName === teacher); const hasSubmitted = !!sigRecord;
                                return (
                                  <div key={teacher} className={`flex items-center justify-between p-2.5 rounded-xl border print:border-none print:p-1 print:border-b ${hasSubmitted ? 'bg-white border-emerald-200 print:bg-white' : 'bg-gray-50 border-gray-200'}`}>
                                    <span className={`text-sm font-bold ${hasSubmitted ? 'text-gray-800' : 'text-gray-400'}`}>{teacher} 교사</span>
                                    {hasSubmitted ? (
                                      <button onClick={() => setSelectedSubmission([sigRecord])} className="flex items-center gap-1 text-[11px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-colors print:border-none print:bg-transparent print:text-gray-800"><FileText size={12} className="print:hidden"/> 개별 확인</button>
                                    ) : ( <span className="text-xs font-bold text-red-400 print:text-gray-500">미제출</span> )}
                                  </div>
                                );
                              })
                            )}
                          </div>
                          {isComplete && (
                            <div className="mt-5 pt-4 border-t border-emerald-100/60 print:border-t-2 print:border-gray-400 print:mt-4">
                              {printRecord ? (
                                <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-emerald-200 shadow-sm print:bg-transparent print:border-none print:p-0 print:shadow-none">
                                  <span className="text-xs font-black text-emerald-700 flex items-center gap-1 print:text-gray-800"><Printer size={14} className="print:hidden"/> 출력 완료 ({formatDateTime(printRecord.printedAt)})</span>
                                  <button onClick={() => togglePrintStatus(subject.name, true)} className="text-gray-400 hover:text-red-500 print:hidden transition-colors"><X size={16}/></button>
                                </div>
                              ) : (
                                <div className="print:hidden"><button onClick={() => togglePrintStatus(subject.name, false)} className="w-full py-2.5 bg-gray-800 text-white font-bold text-xs rounded-xl hover:bg-black active:scale-95 flex items-center justify-center gap-1 shadow-md"><CheckCircle size={16}/> 이 과목 출력 완료 표시</button></div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {statusTab === 'scope' && (
                <div className="animate-fade-in print:block">
                  <div className="mb-6 print:mb-8 text-center text-lg font-black text-gray-800 bg-gray-50 py-3 rounded-xl print:bg-transparent print:p-0 border-b-2 print:border-black print:pb-4 print:hidden">
                    [시험 범위표] {formatExamOption(viewingExamKey)}
                  </div>
                  <div className="text-center mb-6 print:mb-8 hidden print:block"><h2 className="text-3xl font-black tracking-widest">{vYear}학년도 {vSem}학기 {vExam} 시험 범위</h2></div>
                  {renderScheduleTable(true)}
                </div>
              )}

              {statusTab === 'cutoff' && (
                <div className="animate-fade-in print:block">
                  <div className="mb-6 print:mb-8 text-center text-lg font-black text-gray-800 bg-gray-50 py-3 rounded-xl print:bg-transparent print:p-0 border-b-2 print:border-black print:pb-4 print:hidden">
                    [추정분할 점수 현황] {formatExamOption(viewingExamKey)}
                  </div>
                  <div className="text-center mb-6 print:mb-8 hidden print:block"><h2 className="text-3xl font-black tracking-widest">{vYear}학년도 {vSem}학기 {vExam} 추정분할 점수</h2></div>
                  {renderCutoffTable(true)}
                </div>
              )}
            </div>
          )}

          {/* 관리자 설정 화면 */}
          {viewMode === 'admin' && !isAdminUnlocked && (
            <div className="w-full max-w-sm bg-white rounded-[2rem] shadow-xl p-8 mt-12 animate-fade-in text-center border border-gray-100 print:hidden">
              <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><Lock className="text-blue-500" size={28}/></div>
              <h2 className="text-xl font-black text-gray-800 mb-2">관리자 암호 확인</h2><p className="text-sm text-gray-500 mb-6 font-medium">초기 비밀번호는 1234 입니다.</p>
              <form onSubmit={handleUnlockAdmin}>
                <input type="password" value={pinInput} onChange={(e) => setPinInput(e.target.value)} placeholder="비밀번호 입력" className={`w-full p-4 bg-gray-50 border-2 rounded-xl text-center text-xl tracking-[0.5em] font-black outline-none transition-all ${pinError ? 'border-red-400 bg-red-50 text-red-600' : 'border-gray-200 focus:border-blue-500'}`} autoFocus />
                {pinError && <p className="text-xs font-bold text-red-500 mt-2">비밀번호 불일치</p>}
                <button type="submit" className="w-full py-4 mt-6 bg-gray-900 text-white rounded-xl font-black shadow-md hover:bg-black">확인</button>
              </form>
            </div>
          )}
          
          {viewMode === 'admin' && isAdminUnlocked && (
            <div className="w-full max-w-5xl bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white p-6 md:p-10 animate-fade-in mt-4 print:hidden">
              <div className="flex justify-between items-start mb-8 border-b border-gray-100 pb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-3 rounded-2xl"><Settings className="text-purple-600" size={24}/></div>
                  <div><h2 className="text-2xl font-black text-gray-800">전체 환경 설정</h2><p className="text-gray-500 text-sm font-medium">4가지 업무별로 연도와 학기를 독립적으로 셋팅할 수 있습니다.</p></div>
                </div>
                <button onClick={() => setIsAdminUnlocked(false)} className="text-xs text-gray-400 flex items-center gap-1 font-bold hover:text-gray-600"><Lock size={12}/> 잠그기</button>
              </div>

              {adminMessage.text && ( <div className={`p-4 rounded-2xl mb-6 text-sm font-bold flex items-center gap-2 ${adminMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{adminMessage.type === 'success' ? <CheckCircle size={18}/> : <AlertCircle size={18}/>}{adminMessage.text}</div> )}

              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-amber-50/40 border border-amber-200 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3"><ClipboardList size={16} className="text-amber-600"/><h4 className="font-bold text-amber-900 text-sm">시험 및 수행 비율</h4></div>
                    <div className="flex gap-2">
                      <input type="text" value={adminData.activeSettings?.ratio?.year || ''} onChange={e=>setAdminData(p=>({...p, activeSettings: {...p.activeSettings, ratio: {...p.activeSettings.ratio, year: e.target.value}}}))} className="w-1/2 p-2.5 bg-white border border-gray-200 rounded-xl text-center text-sm font-bold focus:border-amber-500 outline-none" placeholder="연도 (예: 2026)"/>
                      <select value={adminData.activeSettings?.ratio?.semester || ''} onChange={e=>setAdminData(p=>({...p, activeSettings: {...p.activeSettings, ratio: {...p.activeSettings.ratio, semester: e.target.value}}}))} className="w-1/2 p-2.5 bg-white border border-gray-200 rounded-xl text-center text-sm font-bold focus:border-amber-500 outline-none"><option value="1">1학기</option><option value="2">2학기</option></select>
                    </div>
                  </div>
                  <div className="bg-blue-50/40 border border-blue-200 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3"><Edit2 size={16} className="text-blue-600"/><h4 className="font-bold text-blue-900 text-sm">출제 서명</h4></div>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" value={adminData.activeSettings?.signature?.year || ''} onChange={e=>setAdminData(p=>({...p, activeSettings: {...p.activeSettings, signature: {...p.activeSettings.signature, year: e.target.value}}}))} className="p-2.5 bg-white border border-gray-200 rounded-xl text-center text-sm font-bold focus:border-blue-500 outline-none" placeholder="연도"/>
                      <select value={adminData.activeSettings?.signature?.semester || ''} onChange={e=>setAdminData(p=>({...p, activeSettings: {...p.activeSettings, signature: {...p.activeSettings.signature, semester: e.target.value}}}))} className="p-2.5 bg-white border border-gray-200 rounded-xl text-center text-sm font-bold focus:border-blue-500 outline-none"><option value="1">1학기</option><option value="2">2학기</option></select>
                      <input type="text" value={adminData.activeSettings?.signature?.examName || ''} onChange={e=>setAdminData(p=>({...p, activeSettings: {...p.activeSettings, signature: {...p.activeSettings.signature, examName: e.target.value}}}))} className="p-2.5 bg-white border border-gray-200 rounded-xl text-center text-sm font-bold focus:border-blue-500 outline-none" placeholder="고사명"/>
                      <input type="text" value={adminData.activeSettings?.signature?.documentDate || ''} onChange={e=>setAdminData(p=>({...p, activeSettings: {...p.activeSettings, signature: {...p.activeSettings.signature, documentDate: e.target.value}}}))} className="p-2.5 bg-white border border-gray-200 rounded-xl text-center text-sm font-bold focus:border-blue-500 outline-none" placeholder="출력용 날짜"/>
                    </div>
                  </div>
                  <div className="bg-indigo-50/40 border border-indigo-200 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3"><CalendarDays size={16} className="text-indigo-600"/><h4 className="font-bold text-indigo-900 text-sm">시험 범위 입력</h4></div>
                    <div className="flex gap-2">
                      <input type="text" value={adminData.activeSettings?.scope?.year || ''} onChange={e=>setAdminData(p=>({...p, activeSettings: {...p.activeSettings, scope: {...p.activeSettings.scope, year: e.target.value}}}))} className="w-1/3 p-2.5 bg-white border border-gray-200 rounded-xl text-center text-sm font-bold focus:border-indigo-500 outline-none" placeholder="연도"/>
                      <select value={adminData.activeSettings?.scope?.semester || ''} onChange={e=>setAdminData(p=>({...p, activeSettings: {...p.activeSettings, scope: {...p.activeSettings.scope, semester: e.target.value}}}))} className="w-1/3 p-2.5 bg-white border border-gray-200 rounded-xl text-center text-sm font-bold focus:border-indigo-500 outline-none"><option value="1">1학기</option><option value="2">2학기</option></select>
                      <input type="text" value={adminData.activeSettings?.scope?.examName || ''} onChange={e=>setAdminData(p=>({...p, activeSettings: {...p.activeSettings, scope: {...p.activeSettings.scope, examName: e.target.value}}}))} className="w-1/3 p-2.5 bg-white border border-gray-200 rounded-xl text-center text-sm font-bold focus:border-indigo-500 outline-none" placeholder="고사명"/>
                    </div>
                  </div>
                  <div className="bg-rose-50/40 border border-rose-200 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3"><Target size={16} className="text-rose-600"/><h4 className="font-bold text-rose-900 text-sm">추정분할 점수 기본연도</h4></div>
                    <div className="flex gap-2">
                      <input type="text" value={adminData.activeSettings?.cutoff?.year || ''} onChange={e=>setAdminData(p=>({...p, activeSettings: {...p.activeSettings, cutoff: {...p.activeSettings.cutoff, year: e.target.value}}}))} className="w-1/2 p-2.5 bg-white border border-gray-200 rounded-xl text-center text-sm font-bold focus:border-rose-500 outline-none" placeholder="연도"/>
                      <select value={adminData.activeSettings?.cutoff?.semester || ''} onChange={e=>setAdminData(p=>({...p, activeSettings: {...p.activeSettings, cutoff: {...p.activeSettings.cutoff, semester: e.target.value}}}))} className="w-1/2 p-2.5 bg-white border border-gray-200 rounded-xl text-center text-sm font-bold focus:border-rose-500 outline-none"><option value="1">1학기</option><option value="2">2학기</option></select>
                    </div>
                  </div>
                </div>

                {/* 수행평가 과목 관리 영역 */}
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-lg font-black text-gray-800 mb-2 flex items-center gap-2">
                    <ClipboardList size={20} className="text-purple-500"/> 
                    [{adminData.activeSettings?.cutoff?.year}년 {adminData.activeSettings?.cutoff?.semester}학기] 수행평가 과목 관리
                  </h3>
                  <p className="text-xs text-purple-700 mb-4 font-bold bg-purple-50 inline-block px-3 py-1.5 rounded-lg border border-purple-100">
                    💡 추정분할 탭에서 '수행평가'를 입력할 때 사용되는 과목 명단입니다.
                  </p>
                  <div className="mb-6 p-5 bg-rose-50/50 border border-rose-100 rounded-2xl">
                    <div className="flex gap-2 mb-4">
                      <select value={newPerfGrade} onChange={e=>setNewPerfGrade(e.target.value)} className="w-1/4 p-2 bg-white border border-rose-200 rounded-lg text-xs font-bold focus:border-rose-500 outline-none"><option value="1">1학년</option><option value="2">2학년</option><option value="3">3학년</option></select>
                      <input type="text" value={newPerfSubject} onChange={e=>setNewPerfSubject(e.target.value)} placeholder="단일 과목명 추가" className="flex-1 p-2 bg-white border border-rose-200 rounded-lg text-xs font-bold focus:border-rose-500 outline-none"/>
                      <button onClick={handleAddSinglePerf} type="button" className="bg-gray-800 text-white px-4 rounded-lg font-bold hover:bg-black active:scale-95 whitespace-nowrap text-xs">개별 추가</button>
                    </div>
                    <p className="text-xs text-rose-700 mb-3 opacity-80 leading-relaxed">또는 엑셀에서 <strong>[학년] [과목명]</strong> 2칸을 복사해 아래에 대량으로 붙여넣으세요.</p>
                    <textarea value={perfBulkInput} onChange={e => setPerfBulkInput(e.target.value)} className="w-full h-20 p-3 bg-white border border-rose-200 rounded-xl text-sm outline-none focus:border-rose-500 resize-none custom-scrollbar" />
                    <button onClick={handlePerfBulkPaste} type="button" className="mt-3 px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700 transition-all shadow-sm active:scale-95">수행평가 과목 일괄 추가</button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                    {(!globalSettings.perfSchedules?.[`${adminData.activeSettings?.cutoff?.year}|${adminData.activeSettings?.cutoff?.semester}`] || globalSettings.perfSchedules?.[`${adminData.activeSettings?.cutoff?.year}|${adminData.activeSettings?.cutoff?.semester}`].length === 0) && <p className="text-center text-sm text-gray-400 py-4">이 학기에 등록된 수행평가 과목이 없습니다.</p>}
                    {(globalSettings.perfSchedules?.[`${adminData.activeSettings?.cutoff?.year}|${adminData.activeSettings?.cutoff?.semester}`] || []).map(item => (
                      <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-200 shadow-sm hover:border-rose-200 text-sm">
                        <span className="font-medium text-gray-800"><strong className="w-16 inline-block text-center">{item.grade}학년</strong> | <strong className="ml-2 text-rose-700">{item.subject}</strong></span>
                        <button onClick={() => removePerfItem(item.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={16}/></button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-lg font-black text-gray-800 mb-2 flex items-center gap-2">
                    <CalendarDays size={20} className="text-purple-500"/> 
                    [{adminData.activeSettings?.scope?.year}년 {adminData.activeSettings?.scope?.semester}학기 {adminData.activeSettings?.scope?.examName}] 시간표 관리
                  </h3>
                  <p className="text-xs text-purple-700 mb-4 font-bold bg-purple-50 inline-block px-3 py-1.5 rounded-lg border border-purple-100">
                    💡 위쪽의 [시험 범위 입력] 세팅을 변경하시면, 해당 고사에 매칭되는 시간표로 즉시 전환됩니다.
                  </p>
                  <div className="mb-6 p-5 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
                    <div className="flex gap-2 mb-4">
                      <input type="text" value={newSchDate} onChange={e=>setNewSchDate(e.target.value)} placeholder="일자 (예: 4.28)" className="w-1/5 p-2 bg-white border border-indigo-200 rounded-lg text-xs font-bold focus:border-indigo-500 outline-none"/>
                      <select value={newSchGrade} onChange={e=>setNewSchGrade(e.target.value)} className="w-1/5 p-2 bg-white border border-indigo-200 rounded-lg text-xs font-bold focus:border-indigo-500 outline-none"><option value="1">1학년</option><option value="2">2학년</option><option value="3">3학년</option></select>
                      <input type="text" value={newSchPeriod} onChange={e=>setNewSchPeriod(e.target.value)} placeholder="교시" className="w-1/5 p-2 bg-white border border-indigo-200 rounded-lg text-xs font-bold focus:border-indigo-500 outline-none"/>
                      <input type="text" value={newSchSubject} onChange={e=>setNewSchSubject(e.target.value)} placeholder="단일 과목명 추가" className="flex-1 p-2 bg-white border border-indigo-200 rounded-lg text-xs font-bold focus:border-indigo-500 outline-none"/>
                      <button onClick={handleAddSingleSchedule} type="button" className="bg-gray-800 text-white px-3 rounded-lg font-bold hover:bg-black active:scale-95 whitespace-nowrap text-xs">개별 추가</button>
                    </div>
                    <p className="text-xs text-indigo-700 mb-3 opacity-80 leading-relaxed">또는 엑셀에서 <strong>[일자] [학년] [교시] [과목]</strong> 4칸 형태의 표를 복사해 대량으로 붙여넣으세요.</p>
                    <textarea value={scheduleBulkInput} onChange={e => setScheduleBulkInput(e.target.value)} className="w-full h-20 p-3 bg-white border border-indigo-200 rounded-xl text-sm outline-none focus:border-indigo-500 resize-none custom-scrollbar" />
                    <button onClick={handleScheduleBulkPaste} type="button" className="mt-3 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-all shadow-sm active:scale-95">시간표 일괄 추가</button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                    {(!globalSettings.schedules?.[`${adminData.activeSettings?.scope?.year}|${adminData.activeSettings?.scope?.semester}|${adminData.activeSettings?.scope?.examName}`] || globalSettings.schedules?.[`${adminData.activeSettings?.scope?.year}|${adminData.activeSettings?.scope?.semester}|${adminData.activeSettings?.scope?.examName}`].length === 0) && <p className="text-center text-sm text-gray-400 py-4">이 시험에 등록된 시간표가 없습니다.</p>}
                    {(globalSettings.schedules?.[`${adminData.activeSettings?.scope?.year}|${adminData.activeSettings?.scope?.semester}|${adminData.activeSettings?.scope?.examName}`] || []).map(item => (
                      <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-200 shadow-sm hover:border-indigo-200 text-sm">
                        <span className="font-medium text-gray-800"><strong className="w-28 inline-block">{item.date}</strong> | <strong className="w-12 inline-block text-center">{item.grade}학년</strong> | <span className="w-12 inline-block text-center">{item.period}교시</span> | <strong className="ml-2 text-indigo-700">{item.subject}</strong></span>
                        <button onClick={() => removeScheduleItem(item.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={16}/></button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-lg font-black text-gray-800 mb-2 flex items-center gap-2"><Users size={20} className="text-purple-500"/> 서명용 공통 과목 및 교사 명단 보관함</h3>
                  <div className="mb-6 p-5 bg-purple-50/50 border border-purple-100 rounded-2xl">
                    <h4 className="text-sm font-black text-purple-900 mb-2 flex items-center gap-2"><FileText size={16}/> 엑셀 명단 대량 붙여넣기</h4>
                    <textarea value={bulkInput} onChange={e => setBulkInput(e.target.value)} className="w-full h-24 p-3 bg-white border border-purple-200 rounded-xl text-sm outline-none focus:border-purple-500 resize-none custom-scrollbar" />
                    <button onClick={handleBulkPaste} type="button" className="mt-3 px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-700 shadow-sm active:scale-95">명단 일괄 적용하기</button>
                  </div>
                  <div className="flex gap-2 mb-6">
                    <input type="text" value={newSubject} onChange={e=>setNewSubject(e.target.value)} placeholder="새 과목 직접 추가" className="flex-1 p-3 bg-white border-2 border-gray-200 rounded-xl text-sm font-bold focus:border-purple-500 outline-none"/>
                    <button onClick={addSubject} className="bg-gray-800 text-white px-5 rounded-xl font-bold hover:bg-black active:scale-95 whitespace-nowrap">과목 추가</button>
                  </div>
                  <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                    {(adminData.subjects || []).map(subject => (
                      <div key={subject.name} className="bg-gray-50 border-2 border-gray-100 rounded-2xl p-4">
                        <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-3"><span className="font-black text-lg text-purple-900">{subject.name}</span><button onClick={() => removeSubject(subject.name)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={16}/></button></div>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {(subject.teachers || []).map(teacher => (
                            <span key={teacher} className="bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-sm font-bold text-gray-700 flex items-center gap-2 shadow-sm">{teacher}<button onClick={()=>removeTeacherFromSubject(subject.name, teacher)} className="text-gray-400 hover:text-red-500"><X size={14}/></button></span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input type="text" value={newTeachers[subject.name] || ''} onChange={e=>setNewTeachers({...newTeachers, [subject.name]: e.target.value})} placeholder="교사 성함 직접 추가" className="flex-1 p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:border-purple-500 outline-none"/>
                          <button onClick={()=>addTeacherToSubject(subject.name)} className="bg-gray-200 text-gray-700 px-4 rounded-lg font-bold hover:bg-gray-300 text-sm flex items-center gap-1"><Plus size={16}/> 추가</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-lg font-black text-gray-800 mb-4 flex items-center gap-2"><List size={20} className="text-purple-500"/> 출제 검토 항목(체크리스트) 관리</h3>
                  <div className="bg-gray-50 border-2 border-gray-100 rounded-2xl p-4">
                    <div className="space-y-2 mb-4 max-h-80 overflow-y-auto custom-scrollbar pr-2">
                      {(adminData.checklist || defaultChecklistData).map(item => (
                        <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-200 shadow-sm hover:border-purple-200">
                          <span className={item.type === 'category' ? 'font-black text-gray-800' : 'text-sm text-gray-600 pl-2 flex-1'}>{item.text}</span>
                          <div className="flex items-center gap-3">
                            {item.type !== 'category' && ( <div className="flex gap-1 bg-gray-100 p-1 rounded-lg"><button onClick={() => updateChecklistStatus(item.id, 'O')} className={`px-3 py-1 text-xs font-black rounded-md ${item.status !== 'X' ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-400'}`}>O</button><button onClick={() => updateChecklistStatus(item.id, 'X')} className={`px-3 py-1 text-xs font-black rounded-md ${item.status === 'X' ? 'bg-red-500 text-white shadow-sm' : 'text-gray-400'}`}>X</button></div> )}
                            <button onClick={() => removeChecklistItem(item.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={16}/></button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 pt-4 border-t border-gray-200">
                      <select value={newChecklistType} onChange={e=>setNewChecklistType(e.target.value)} className="p-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 shrink-0"><option value="category">대분류</option><option value="item1">중분류</option><option value="item2">소분류</option></select>
                      <input type="text" value={newChecklistText} onChange={e=>setNewChecklistText(e.target.value)} placeholder="검토 항목 내용 입력" className="flex-1 p-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-purple-500 outline-none"/>
                      <button type="button" onClick={addChecklistItem} className="bg-gray-800 text-white px-4 rounded-xl font-bold hover:bg-black whitespace-nowrap shrink-0">항목 추가</button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-lg font-black text-gray-800 mb-4 flex items-center gap-2"><History size={20} className="text-red-500"/> 과거 시험 기록 관리 (삭제)</h3>
                  <div className="bg-red-50/50 border-2 border-red-100 rounded-2xl p-4">
                    {examOptions.length === 0 ? ( <p className="text-sm text-gray-500 text-center py-2">기록된 시험이 없습니다.</p> ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                        {examOptions.map(opt => (
                          <div key={opt} className="flex justify-between items-center bg-white p-3 rounded-xl border border-red-100 shadow-sm">
                            <span className="font-bold text-gray-800 text-sm">{formatExamOption(opt)}</span>
                            {deleteExamKey === opt ? (
                              <div className="flex gap-2"><button onClick={() => setDeleteExamKey(null)} className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-300">취소</button><button onClick={() => executeDeleteExamRecords(opt)} className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 animate-pulse shadow-sm">확인(영구삭제)</button></div>
                            ) : ( <button onClick={() => setDeleteExamKey(opt)} className="text-red-400 hover:text-red-600 flex items-center gap-1 text-xs font-bold bg-red-50 px-2 py-1 rounded-lg border border-red-100"><Trash2 size={14}/> 삭제</button> )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <button onClick={handleAdminSave} className="w-full py-5 bg-purple-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-purple-200 hover:bg-purple-700 active:scale-95 flex items-center justify-center gap-2 mt-8 sticky bottom-4">
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
