/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Trash2, Database, ChevronRight, Play, SkipForward, RefreshCw, User, GraduationCap, Hash, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BTree, BTreeKey, SimulationStep } from './lib/btree';
import BTreeVisualizer from './components/BTreeVisualizer';
import { cn } from './lib/utils';

interface Student {
  id: string;
  name: string;
  gender: string;
  className: string;
  fileIndex: number;
}

export default function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [idTree, setIdTree] = useState<BTree>(new BTree(3));
  const [nameTree, setNameTree] = useState<BTree>(new BTree(3));
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'id' | 'name'>('id');
  const [newStudent, setNewStudent] = useState({ id: '', name: '', gender: 'Nam', className: '' });
  const [simulationSteps, setSimulationSteps] = useState<SimulationStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isSimulating, setIsSimulating] = useState(false);
  const [foundStudent, setFoundStudent] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState<'visualizer' | 'jsonl'>('visualizer');
  const [visualizingTree, setVisualizingTree] = useState<'id' | 'name'>('id');

  // Initialize with some data
  useEffect(() => {
    const initialData = [
    { id: '24520001', name: 'Nguyễn Minh Anh', gender: 'Nữ', className: 'CNTT1', fileIndex: 0 },
    { id: '24520002', name: 'Trần Hoàng Nam', gender: 'Nam', className: 'CNTT2', fileIndex: 1 },
    { id: '24520003', name: 'Lê Thu Hà', gender: 'Nữ', className: 'KTPM1', fileIndex: 2 },
    { id: '24520004', name: 'Phạm Gia Bảo', gender: 'Nam', className: 'KTPM2', fileIndex: 3 },
    { id: '24520005', name: 'Hoàng Minh Đức', gender: 'Nam', className: 'HTTT1', fileIndex: 4 },
    { id: '24520006', name: 'Vũ Thùy Linh', gender: 'Nữ', className: 'CNTT1', fileIndex: 5 },
    { id: '24520007', name: 'Đặng Quốc Khánh', gender: 'Nam', className: 'CNTT2', fileIndex: 6 },
    { id: '24520008', name: 'Bùi Phương Thảo', gender: 'Nữ', className: 'KTPM1', fileIndex: 7 },
    { id: '24520009', name: 'Đỗ Anh Tuấn', gender: 'Nam', className: 'KTPM2', fileIndex: 8 },
    { id: '24520010', name: 'Ngô Bảo Ngọc', gender: 'Nữ', className: 'HTTT1', fileIndex: 9 },
    { id: '24520011', name: 'Lý Hải Đăng', gender: 'Nam', className: 'CNTT1', fileIndex: 10 },
    { id: '24520012', name: 'Trịnh Kim Chi', gender: 'Nữ', className: 'CNTT2', fileIndex: 11 },
    { id: '24520013', name: 'Trương Công Vinh', gender: 'Nam', className: 'KTPM1', fileIndex: 12 },
    { id: '24520014', name: 'Phan Tuyết Mai', gender: 'Nữ', className: 'KTPM2', fileIndex: 13 },
    { id: '24520015', name: 'Hồ Văn Ý', gender: 'Nam', className: 'HTTT1', fileIndex: 14 },
    { id: '24520016', name: 'Nguyễn Thị Nở', gender: 'Nữ', className: 'CNTT1', fileIndex: 15 },
    { id: '24520017', name: 'Trần Chí Phèo', gender: 'Nam', className: 'CNTT2', fileIndex: 16 },
    { id: '24520018', name: 'Lê Xuân Diệu', gender: 'Nam', className: 'KTPM1', fileIndex: 17 },
    { id: '24520019', name: 'Hàn Mặc Tử', gender: 'Nam', className: 'KTPM2', fileIndex: 18 },
    { id: '24520020', name: 'Xuân Quỳnh', gender: 'Nữ', className: 'HTTT1', fileIndex: 19 },
    { id: '24520021', name: 'Quang Trung', gender: 'Nam', className: 'CNTT1', fileIndex: 20 },
    { id: '24520022', name: 'Gia Long', gender: 'Nam', className: 'CNTT2', fileIndex: 21 },
    { id: '24520023', name: 'Minh Mạng', gender: 'Nam', className: 'KTPM1', fileIndex: 22 },
    { id: '24520024', name: 'Tự Đức', gender: 'Nam', className: 'KTPM2', fileIndex: 23 },
    { id: '24520025', name: 'Hàm Nghi', gender: 'Nam', className: 'HTTT1', fileIndex: 24 },
    { id: '24520026', name: 'Phan Bội Châu', gender: 'Nam', className: 'CNTT1', fileIndex: 25 },
    { id: '24520027', name: 'Phan Chu Trinh', gender: 'Nam', className: 'CNTT2', fileIndex: 26 },
    { id: '24520028', name: 'Huỳnh Thúc Kháng', gender: 'Nam', className: 'KTPM1', fileIndex: 27 },
    { id: '24520029', name: 'Nguyễn Ái Quốc', gender: 'Nam', className: 'KTPM2', fileIndex: 28 },
    { id: '24520030', name: 'Võ Nguyên Giáp', gender: 'Nam', className: 'HTTT1', fileIndex: 29 },
    { id: '24520031', name: 'Trường Chinh', gender: 'Nam', className: 'CNTT1', fileIndex: 30 },
    { id: '24520032', name: 'Phạm Văn Đồng', gender: 'Nam', className: 'CNTT2', fileIndex: 31 },
    { id: '24520033', name: 'Lê Duẩn', gender: 'Nam', className: 'KTPM1', fileIndex: 32 },
    { id: '24520034', name: 'Nguyễn Văn Linh', gender: 'Nam', className: 'KTPM2', fileIndex: 33 },
    { id: '24520035', name: 'Đỗ Mười', gender: 'Nam', className: 'HTTT1', fileIndex: 34 },
    { id: '24520036', name: 'Phan Đình Phùng', gender: 'Nam', className: 'CNTT1', fileIndex: 35 },
    { id: '24520037', name: 'Hoàng Hoa Thám', gender: 'Nam', className: 'CNTT2', fileIndex: 36 },
    { id: '24520038', name: 'Nguyễn Thái Học', gender: 'Nam', className: 'KTPM1', fileIndex: 37 },
    { id: '24520039', name: 'Lý Tự Trọng', gender: 'Nam', className: 'KTPM2', fileIndex: 38 },
    { id: '24520040', name: 'Nguyễn Văn Cừ', gender: 'Nam', className: 'HTTT1', fileIndex: 39 },
    { id: '24520041', name: 'Tô Hiệu', gender: 'Nam', className: 'CNTT1', fileIndex: 40 },
    { id: '24520042', name: 'Nguyễn Thị Minh Khai', gender: 'Nữ', className: 'CNTT2', fileIndex: 41 },
    { id: '24520043', name: 'Võ Thị Sáu', gender: 'Nữ', className: 'KTPM1', fileIndex: 42 },
    { id: '24520044', name: 'Nguyễn Thị Định', gender: 'Nữ', className: 'KTPM2', fileIndex: 43 },
    { id: '24520045', name: 'Tôn Đức Thắng', gender: 'Nam', className: 'HTTT1', fileIndex: 44 },
    { id: '24520046', name: 'Phạm Hùng', gender: 'Nam', className: 'CNTT1', fileIndex: 45 },
    { id: '24520047', name: 'Lê Đức Thọ', gender: 'Nam', className: 'CNTT2', fileIndex: 46 },
    { id: '24520048', name: 'Nguyễn Văn Thiệu', gender: 'Nam', className: 'KTPM1', fileIndex: 47 },
    { id: '24520049', name: 'Dương Văn Minh', gender: 'Nam', className: 'KTPM2', fileIndex: 48 },
    { id: '24520050', name: 'Ngô Đình Diệm', gender: 'Nam', className: 'HTTT1', fileIndex: 49 },
    { id: '24520051', name: 'Nguyễn Du', gender: 'Nam', className: 'CNTT1', fileIndex: 50 },
    { id: '24520052', name: 'Hồ Xuân Hương', gender: 'Nữ', className: 'CNTT2', fileIndex: 51 },
    { id: '24520053', name: 'Nguyễn Đình Chiểu', gender: 'Nam', className: 'KTPM1', fileIndex: 52 },
    { id: '24520054', name: 'Nguyễn Công Trứ', gender: 'Nam', className: 'KTPM2', fileIndex: 53 },
    { id: '24520055', name: 'Cao Bá Quát', gender: 'Nam', className: 'HTTT1', fileIndex: 54 },
    { id: '24520056', name: 'Tản Đà', gender: 'Nam', className: 'CNTT1', fileIndex: 55 },
    { id: '24520057', name: 'Xuân Diệu', gender: 'Nam', className: 'CNTT2', fileIndex: 56 },
    { id: '24520058', name: 'Huy Cận', gender: 'Nam', className: 'KTPM1', fileIndex: 57 },
    { id: '24520059', name: 'Chế Lan Viên', gender: 'Nam', className: 'KTPM2', fileIndex: 58 },
    { id: '24520060', name: 'Tố Hữu', gender: 'Nam', className: 'HTTT1', fileIndex: 59 },
    { id: '24520061', name: 'Nam Cao', gender: 'Nam', className: 'CNTT1', fileIndex: 60 },
    { id: '24520062', name: 'Ngô Tất Tố', gender: 'Nam', className: 'CNTT2', fileIndex: 61 },
    { id: '24520063', name: 'Vũ Trọng Phụng', gender: 'Nam', className: 'KTPM1', fileIndex: 62 },
    { id: '24520064', name: 'Nguyễn Huy Tưởng', gender: 'Nam', className: 'KTPM2', fileIndex: 63 },
    { id: '24520065', name: 'Kim Lân', gender: 'Nam', className: 'HTTT1', fileIndex: 64 },
    { id: '24520066', name: 'Nguyễn Khải', gender: 'Nam', className: 'CNTT1', fileIndex: 65 },
    { id: '24520067', name: 'Nguyễn Minh Châu', gender: 'Nam', className: 'CNTT2', fileIndex: 66 },
    { id: '24520068', name: 'Nguyễn Nhật Ánh', gender: 'Nam', className: 'KTPM1', fileIndex: 67 },
    { id: '24520069', name: 'Bùi Giáng', gender: 'Nam', className: 'KTPM2', fileIndex: 68 },
    { id: '24520070', name: 'Hàn Mặc Tử', gender: 'Nam', className: 'HTTT1', fileIndex: 69 },
    { id: '24520071', name: 'Trịnh Công Sơn', gender: 'Nam', className: 'CNTT1', fileIndex: 70 },
    { id: '24520072', name: 'Văn Cao', gender: 'Nam', className: 'CNTT2', fileIndex: 71 },
    { id: '24520073', name: 'Phạm Duy', gender: 'Nam', className: 'KTPM1', fileIndex: 72 },
    { id: '24520074', name: 'Hoàng Vân', gender: 'Nam', className: 'KTPM2', fileIndex: 73 },
    { id: '24520075', name: 'Đặng Thái Sơn', gender: 'Nam', className: 'HTTT1', fileIndex: 74 },
    { id: '24520076', name: 'Nguyễn Thị Bình', gender: 'Nữ', className: 'CNTT1', fileIndex: 75 },
    { id: '24520077', name: 'Tạ Quang Bửu', gender: 'Nam', className: 'CNTT2', fileIndex: 76 },
    { id: '24520078', name: 'Nguyễn Xiển', gender: 'Nam', className: 'KTPM1', fileIndex: 77 },
    { id: '24520079', name: 'Hoàng Tụy', gender: 'Nam', className: 'KTPM2', fileIndex: 78 },
    { id: '24520080', name: 'Ngô Bảo Châu', gender: 'Nam', className: 'HTTT1', fileIndex: 79 },
    { id: '24520081', name: 'Nguyễn Chí Thanh', gender: 'Nam', className: 'CNTT1', fileIndex: 80 },
    { id: '24520082', name: 'Trần Đại Nghĩa', gender: 'Nam', className: 'CNTT2', fileIndex: 81 },
    { id: '24520083', name: 'Nguyễn Sơn', gender: 'Nam', className: 'KTPM1', fileIndex: 82 },
    { id: '24520084', name: 'Chu Văn An', gender: 'Nam', className: 'KTPM2', fileIndex: 83 },
    { id: '24520085', name: 'Lương Thế Vinh', gender: 'Nam', className: 'HTTT1', fileIndex: 84 },
    { id: '24520086', name: 'Mạc Đĩnh Chi', gender: 'Nam', className: 'CNTT1', fileIndex: 85 },
    { id: '24520087', name: 'Nguyễn Bỉnh Khiêm', gender: 'Nam', className: 'CNTT2', fileIndex: 86 },
    { id: '24520088', name: 'Lê Quý Đôn', gender: 'Nam', className: 'KTPM1', fileIndex: 87 },
    { id: '24520089', name: 'Phan Huy Chú', gender: 'Nam', className: 'KTPM2', fileIndex: 88 },
    { id: '24520090', name: 'Nguyễn Văn Tố', gender: 'Nam', className: 'HTTT1', fileIndex: 89 },
    { id: '24520091', name: 'Bùi Thị Xuân', gender: 'Nữ', className: 'CNTT1', fileIndex: 90 },
    { id: '24520092', name: 'Nguyễn Thị Duệ', gender: 'Nữ', className: 'CNTT2', fileIndex: 91 },
    { id: '24520093', name: 'Đoàn Thị Điểm', gender: 'Nữ', className: 'KTPM1', fileIndex: 92 },
    { id: '24520094', name: 'Nguyễn Thị Lộ', gender: 'Nữ', className: 'KTPM2', fileIndex: 93 },
    { id: '24520095', name: 'Huyền Trân', gender: 'Nữ', className: 'HTTT1', fileIndex: 94 },
    { id: '24520096', name: 'Triệu Thị Trinh', gender: 'Nữ', className: 'CNTT1', fileIndex: 95 },
    { id: '24520097', name: 'Hai Bà Trưng', gender: 'Nữ', className: 'CNTT2', fileIndex: 96 },
    { id: '24520098', name: 'Lý Chiêu Hoàng', gender: 'Nữ', className: 'KTPM1', fileIndex: 97 },
    { id: '24520099', name: 'Dương Vân Nga', gender: 'Nữ', className: 'KTPM2', fileIndex: 98 },
    { id: '24520100', name: 'Ỷ Lan', gender: 'Nữ', className: 'HTTT1', fileIndex: 99 },
    { id: '24520101', name: 'Chu Nguyên Chương', gender: 'Nam', className: 'CNTT1', fileIndex: 100 },
    { id: '24520102', name: 'Lý Thế Dân', gender: 'Nam', className: 'CNTT2', fileIndex: 101 },
    { id: '24520103', name: 'Ái Tân Giác La Hoằng Lịch', gender: 'Nam', className: 'KTPM1', fileIndex: 102 },
    { id: '24520104', name: 'Ái Tân Giác La Huyền Diệp', gender: 'Nam', className: 'KTPM2', fileIndex: 103 },
    { id: '24520105', name: 'Khang Hy', gender: 'Nam', className: 'HTTT1', fileIndex: 104 },
    { id: '24520106', name: 'Ung Chính', gender: 'Nam', className: 'CNTT1', fileIndex: 105 },
    { id: '24520107', name: 'Càn Long', gender: 'Nam', className: 'CNTT2', fileIndex: 106 },
    { id: '24520108', name: 'Tần Thủy Hoàng', gender: 'Nam', className: 'KTPM1', fileIndex: 107 },
    { id: '24520109', name: 'Hán Vũ Đế', gender: 'Nam', className: 'KTPM2', fileIndex: 108 },
    { id: '24520110', name: 'Hán Cao Tổ', gender: 'Nam', className: 'HTTT1', fileIndex: 109 },
    { id: '24520111', name: 'Lưu Bang', gender: 'Nam', className: 'CNTT1', fileIndex: 110 },
    { id: '24520112', name: 'Hạng Vũ', gender: 'Nam', className: 'CNTT2', fileIndex: 111 },
    { id: '24520113', name: 'Lưu Bị', gender: 'Nam', className: 'KTPM1', fileIndex: 112 },
    { id: '24520114', name: 'Quan Vũ', gender: 'Nam', className: 'KTPM2', fileIndex: 113 },
    { id: '24520115', name: 'Trương Phi', gender: 'Nam', className: 'HTTT1', fileIndex: 114 },
    { id: '24520116', name: 'Tào Tháo', gender: 'Nam', className: 'CNTT1', fileIndex: 115 },
    { id: '24520117', name: 'Tôn Quyền', gender: 'Nam', className: 'CNTT2', fileIndex: 116 },
    { id: '24520118', name: 'Gia Cát Lượng', gender: 'Nam', className: 'KTPM1', fileIndex: 117 },
    { id: '24520119', name: 'Triệu Vân', gender: 'Nam', className: 'KTPM2', fileIndex: 118 },
    { id: '24520120', name: 'Hoàng Trung', gender: 'Nam', className: 'HTTT1', fileIndex: 119 },
    { id: '24520121', name: 'Mã Siêu', gender: 'Nam', className: 'CNTT1', fileIndex: 120 },
    { id: '24520122', name: 'Bàng Thống', gender: 'Nam', className: 'CNTT2', fileIndex: 121 },
    { id: '24520123', name: 'Tư Mã Ý', gender: 'Nam', className: 'KTPM1', fileIndex: 122 },
    { id: '24520124', name: 'Tư Mã Chiêu', gender: 'Nam', className: 'KTPM2', fileIndex: 123 },
    { id: '24520125', name: 'Tư Mã Viêm', gender: 'Nam', className: 'HTTT1', fileIndex: 124 },
    { id: '24520126', name: 'Đường Thái Tông', gender: 'Nam', className: 'CNTT1', fileIndex: 125 },
    { id: '24520127', name: 'Đường Cao Tổ', gender: 'Nam', className: 'CNTT2', fileIndex: 126 },
    { id: '24520128', name: 'Võ Tắc Thiên', gender: 'Nữ', className: 'KTPM1', fileIndex: 127 },
    { id: '24520129', name: 'Dương Quý Phi', gender: 'Nữ', className: 'KTPM2', fileIndex: 128 },
    { id: '24520130', name: 'Bao Thanh Thiên', gender: 'Nam', className: 'HTTT1', fileIndex: 129 },
    { id: '24520131', name: 'Triệu Khuông Dẫn', gender: 'Nam', className: 'CNTT1', fileIndex: 130 },
    { id: '24520132', name: 'Triệu Quang Nghĩa', gender: 'Nam', className: 'CNTT2', fileIndex: 131 },
    { id: '24520133', name: 'Chu Du', gender: 'Nam', className: 'KTPM1', fileIndex: 132 },
    { id: '24520134', name: 'Lục Tốn', gender: 'Nam', className: 'KTPM2', fileIndex: 133 },
    { id: '24520135', name: 'Hàn Tín', gender: 'Nam', className: 'HTTT1', fileIndex: 134 },
    { id: '24520136', name: 'Trương Lương', gender: 'Nam', className: 'CNTT1', fileIndex: 135 },
    { id: '24520137', name: 'Tiêu Hà', gender: 'Nam', className: 'CNTT2', fileIndex: 136 },
    { id: '24520138', name: 'Vương An Thạch', gender: 'Nam', className: 'KTPM1', fileIndex: 137 },
    { id: '24520139', name: 'Tô Đông Pha', gender: 'Nam', className: 'KTPM2', fileIndex: 138 },
    { id: '24520140', name: 'Tô Triệt', gender: 'Nam', className: 'HTTT1', fileIndex: 139 },
    { id: '24520141', name: 'Lỗ Tấn', gender: 'Nam', className: 'CNTT1', fileIndex: 140 },
    { id: '24520142', name: 'Quách Mạt Nhược', gender: 'Nam', className: 'CNTT2', fileIndex: 141 },
    { id: '24520143', name: 'Mao Trạch Đông', gender: 'Nam', className: 'KTPM1', fileIndex: 142 },
    { id: '24520144', name: 'Chu Ân Lai', gender: 'Nam', className: 'KTPM2', fileIndex: 143 },
    { id: '24520145', name: 'Đặng Tiểu Bình', gender: 'Nam', className: 'HTTT1', fileIndex: 144 },
    { id: '24520146', name: 'Tập Trọng Huân', gender: 'Nam', className: 'CNTT1', fileIndex: 145 },
    { id: '24520147', name: 'Tập Cận Bình', gender: 'Nam', className: 'CNTT2', fileIndex: 146 },
    { id: '24520148', name: 'Lý Khắc Cường', gender: 'Nam', className: 'KTPM1', fileIndex: 147 },
    { id: '24520149', name: 'Hồ Cẩm Đào', gender: 'Nam', className: 'KTPM2', fileIndex: 148 },
    { id: '24520150', name: 'Giang Trạch Dân', gender: 'Nam', className: 'HTTT1', fileIndex: 149 }
    ];
    setStudents(initialData);
    const newIdTree = new BTree(3);
    const newNameTree = new BTree(3);
    initialData.forEach(s => {
      newIdTree.insert({ key: s.id, fileIndex: s.fileIndex });
      newNameTree.insert({ key: s.name, fileIndex: s.fileIndex });
    });
    setIdTree(newIdTree);
    setNameTree(newNameTree);
  }, []);

  const handleInsert = () => {
    if (!newStudent.id || !newStudent.name) return;
    
    // Check if ID already exists
    if (students.some(s => s.id === newStudent.id)) {
      alert('Mã số sinh viên đã tồn tại!');
      return;
    }

    // Check if Name already exists (Requirement: unique names)
    if (students.some(s => s.name === newStudent.name)) {
      alert('Tên sinh viên đã tồn tại! Hệ thống yêu cầu tên độc nhất cho chỉ mục.');
      return;
    }

    const steps: SimulationStep[] = [];
    const fileIndex = students.length;
    const student: Student = { ...newStudent, fileIndex };
    
    const updatedIdTree = Object.assign(Object.create(Object.getPrototypeOf(idTree)), idTree);
    const updatedNameTree = Object.assign(Object.create(Object.getPrototypeOf(nameTree)), nameTree);
    
    // For simulation, we'll show steps for the currently visualized tree
    if (visualizingTree === 'id') {
      updatedIdTree.insert({ key: student.id, fileIndex }, steps);
      updatedNameTree.insert({ key: student.name, fileIndex });
    } else {
      updatedNameTree.insert({ key: student.name, fileIndex }, steps);
      updatedIdTree.insert({ key: student.id, fileIndex });
    }
    
    setStudents([...students, student]);
    setIdTree(updatedIdTree);
    setNameTree(updatedNameTree);
    setSimulationSteps(steps);
    setCurrentStepIndex(0);
    setIsSimulating(true);
    setNewStudent({ id: '', name: '', gender: 'Nam', className: '' });
  };

  const [jsonlInput, setJsonlInput] = useState('');

  const handleInsertJsonl = () => {
    if (!jsonlInput.trim()) return;
    
    const lines = jsonlInput.trim().split('\n');
    const newStudents: Student[] = [];
    const steps: SimulationStep[] = [];
    
    const updatedIdTree = Object.assign(Object.create(Object.getPrototypeOf(idTree)), idTree);
    const updatedNameTree = Object.assign(Object.create(Object.getPrototypeOf(nameTree)), nameTree);
    
    let errorCount = 0;
    lines.forEach((line) => {
      try {
        const data = JSON.parse(line);
        if (!data.id || !data.name) return;
        
        // Check uniqueness for both ID and Name
        const idExists = students.some(s => s.id === data.id) || newStudents.some(s => s.id === data.id);
        const nameExists = students.some(s => s.name === data.name) || newStudents.some(s => s.name === data.name);
        
        if (idExists || nameExists) {
          errorCount++;
          return;
        }

        const fileIndex = students.length + newStudents.length;
        const student: Student = {
          id: data.id,
          name: data.name,
          gender: data.gender || 'Nam',
          className: data.class || data.className || 'Unknown',
          fileIndex
        };
        
        if (visualizingTree === 'id') {
          updatedIdTree.insert({ key: student.id, fileIndex }, steps);
          updatedNameTree.insert({ key: student.name, fileIndex });
        } else {
          updatedNameTree.insert({ key: student.name, fileIndex }, steps);
          updatedIdTree.insert({ key: student.id, fileIndex });
        }
        newStudents.push(student);
      } catch (e) {
        errorCount++;
      }
    });

    if (newStudents.length > 0) {
      setStudents([...students, ...newStudents]);
      setIdTree(updatedIdTree);
      setNameTree(updatedNameTree);
      setSimulationSteps(steps);
      setCurrentStepIndex(0);
      setIsSimulating(true);
      setJsonlInput('');
      setActiveTab('visualizer');
    }

    if (errorCount > 0) {
      alert(`Đã thêm ${newStudents.length} sinh viên. Có ${errorCount} dòng bị lỗi hoặc trùng lặp (ID hoặc Tên).`);
    }
  };

  const handleDelete = (id: string) => {
    const studentToDelete = students.find(s => s.id === id);
    if (!studentToDelete) return;

    const steps: SimulationStep[] = [];
    const updatedIdTree = Object.assign(Object.create(Object.getPrototypeOf(idTree)), idTree);
    const updatedNameTree = Object.assign(Object.create(Object.getPrototypeOf(nameTree)), nameTree);
    
    if (visualizingTree === 'id') {
      updatedIdTree.delete(id, steps);
      updatedNameTree.delete(studentToDelete.name);
    } else {
      updatedNameTree.delete(studentToDelete.name, steps);
      updatedIdTree.delete(id);
    }
    
    setStudents(students.filter(s => s.id !== id));
    setIdTree(updatedIdTree);
    setNameTree(updatedNameTree);
    setSimulationSteps(steps);
    setCurrentStepIndex(0);
    setIsSimulating(true);
  };

  const handleSearch = () => {
    if (!searchQuery) return;
    const steps: SimulationStep[] = [];
    const treeToSearch = searchType === 'id' ? idTree : nameTree;
    
    // Switch visualization to the tree being searched
    setVisualizingTree(searchType);
    
    const result = treeToSearch.search(treeToSearch.root, searchQuery, steps);
    
    setSimulationSteps(steps);
    setCurrentStepIndex(0);
    setIsSimulating(true);
    
    if (result) {
      const student = students.find(s => searchType === 'id' ? s.id === searchQuery : s.name === searchQuery);
      setFoundStudent(student || null);
    } else {
      setFoundStudent(null);
    }
  };

  const nextStep = () => {
    if (currentStepIndex < simulationSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      setIsSimulating(false);
    }
  };

  const skipAnimation = () => {
    setCurrentStepIndex(simulationSteps.length - 1);
    setIsSimulating(false);
  };

  const currentStep = simulationSteps[currentStepIndex];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-indigo-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600 p-2 rounded-lg text-white">
            <Database size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Hệ Thống Chỉ Mục Sinh Viên</h1>
            <p className="text-xs text-emerald-500 font-medium uppercase tracking-wider">Mô phỏng B-Tree v1.0 • Bậc 3 (Cây 2-3)</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('visualizer')}
              className={cn(
                "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                activeTab === 'visualizer' ? "bg-white shadow-sm text-emerald-600" : "text-slate-600 hover:text-slate-900"
              )}
            >
              Trực Quan Hóa
            </button>
            <button 
              onClick={() => setActiveTab('jsonl')}
              className={cn(
                "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                activeTab === 'jsonl' ? "bg-white shadow-sm text-emerald-600" : "text-slate-600 hover:text-slate-900"
              )}
            >
              Nguồn JSONL
            </button>
          </div>
        </div>
      </header>

      <main className="p-8 max-w-[1600px] mx-auto grid grid-cols-12 gap-8">
        
        {/* Left Panel: Controls & Data */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          
          {/* Search Card */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Search size={16} /> Tìm Kiếm Chỉ Mục
            </h2>
            <div className="flex flex-col gap-3">
              <div className="flex bg-slate-100 p-1 rounded-lg w-full">
                <button 
                  onClick={() => setSearchType('id')}
                  className={cn(
                    "flex-1 py-1.5 text-xs font-bold rounded-md transition-all",
                    searchType === 'id' ? "bg-white shadow-sm text-emerald-600" : "text-slate-500"
                  )}
                >
                  Theo MSSV
                </button>
                <button 
                  onClick={() => setSearchType('name')}
                  className={cn(
                    "flex-1 py-1.5 text-xs font-bold rounded-md transition-all",
                    searchType === 'name' ? "bg-white shadow-sm text-emerald-600" : "text-slate-500"
                  )}
                >
                  Theo Tên
                </button>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder={searchType === 'id' ? "Nhập MSSV (ví dụ: 24522016)" : "Nhập Tên (ví dụ: Nguyễn Thanh Sơn)"}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <button 
                  onClick={handleSearch}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg shadow-emerald-200 active:scale-95"
                >
                  Tìm
                </button>
              </div>
            </div>
          </section>

          {/* Add Student Card */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Plus size={16} /> Thêm Sinh Viên Mới
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 ml-1">MSSV</label>
                  <input 
                    type="text" 
                    placeholder="2452..." 
                    value={newStudent.id}
                    onChange={(e) => setNewStudent({...newStudent, id: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 ml-1">Lớp</label>
                  <input 
                    type="text" 
                    placeholder="CNTT..." 
                    value={newStudent.className}
                    onChange={(e) => setNewStudent({...newStudent, className: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 ml-1">Họ và Tên (Duy nhất)</label>
                <input 
                  type="text" 
                  placeholder="Nguyễn Thanh Sơn" 
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="text-xs font-bold text-slate-500 ml-1">Giới tính:</label>
                <div className="flex gap-2">
                  {['Nam', 'Nữ'].map(g => (
                    <button 
                      key={g}
                      onClick={() => setNewStudent({...newStudent, gender: g})}
                      className={cn(
                        "px-4 py-1.5 text-sm rounded-lg border transition-all",
                        newStudent.gender === g ? "bg-emerald-50 border-emerald-200 text-emerald-600 font-bold" : "bg-white border-slate-200 text-slate-600"
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <button 
                onClick={handleInsert}
                className="w-full bg-emerald-900 hover:bg-emerald-800 text-white py-3 rounded-xl font-bold transition-all mt-2 active:scale-[0.98]"
              >
                Chèn vào Chỉ Mục
              </button>
            </div>
          </section>

          {/* Simulation Info */}
          <AnimatePresence>
            {isSimulating && currentStep && (
              <motion.section 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-amber-800 uppercase tracking-widest flex items-center gap-2">
                    <Play size={16} /> Bước Mô Phỏng {currentStepIndex + 1}/{simulationSteps.length}
                  </h2>
                  <div className="flex gap-2">
                    <button onClick={nextStep} className="p-1.5 hover:bg-amber-200 rounded-lg text-amber-800 transition-colors">
                      <ChevronRight size={20} />
                    </button>
                    <button onClick={skipAnimation} className="p-1.5 hover:bg-amber-200 rounded-lg text-amber-800 transition-colors">
                      <SkipForward size={20} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/50 rounded-xl p-4 border border-amber-100 h-full">
                    <p className="text-amber-900 font-medium">{currentStep.description}</p>
                    <div className="mt-2 text-xs font-mono text-amber-700 bg-amber-100/50 px-2 py-1 rounded inline-block">
                      Hành động: {currentStep.type.toUpperCase()}
                    </div>
                  </div>
                  {currentStep.codeSnippet && (
                    <div className="bg-slate-900 rounded-xl p-4 overflow-hidden border border-slate-800 shadow-inner">
                      <div className="flex items-center gap-2 mb-2 border-b border-slate-800 pb-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="text-[10px] font-mono text-slate-500 ml-2">BTree.ts</span>
                      </div>
                      <div className="text-[10px] font-mono overflow-x-auto leading-relaxed">
                        {currentStep.codeSnippet.split('\n').map((line, i) => {
                          const lineNum = i + 1;
                          const isHighlighted = currentStep.highlightLines?.includes(lineNum);
                          return (
                            <div 
                              key={i} 
                              className={cn(
                                "flex gap-4 px-2 py-0.5 transition-colors",
                                isHighlighted ? "bg-emerald-500/20 text-emerald-300 border-l-2 border-emerald-500" : "text-slate-400"
                              )}
                            >
                              <span className="w-4 text-right text-slate-600 select-none">{lineNum}</span>
                              <pre className="whitespace-pre"><code>{line}</code></pre>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* Search Result */}
          <AnimatePresence>
            {!isSimulating && foundStudent && (
              <motion.section 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 shadow-sm"
              >
                <h2 className="text-sm font-bold text-emerald-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Info size={16} /> Đã Tìm Thấy Sinh Viên
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-700">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-emerald-900">{foundStudent.name}</p>
                      <p className="text-xs text-emerald-700">{foundStudent.id}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-emerald-100">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-emerald-600">Lớp</p>
                      <p className="text-sm font-medium text-emerald-900">{foundStudent.className}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-emerald-600">Chỉ số File</p>
                      <p className="text-sm font-medium text-emerald-900">Dòng {foundStudent.fileIndex + 1}</p>
                    </div>
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>

        </div>

        {/* Right Panel: Visualization */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          
          {activeTab === 'visualizer' ? (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Cấu Trúc B-Tree</h2>
                    <div className="flex bg-slate-200 p-0.5 rounded-lg mt-1">
                      <button 
                        onClick={() => setVisualizingTree('id')}
                        className={cn(
                          "px-3 py-1 text-[10px] font-bold rounded-md transition-all",
                          visualizingTree === 'id' ? "bg-white shadow-sm text-emerald-600" : "text-slate-500"
                        )}
                      >
                        Chỉ mục MSSV
                      </button>
                      <button 
                        onClick={() => setVisualizingTree('name')}
                        className={cn(
                          "px-3 py-1 text-[10px] font-bold rounded-md transition-all",
                          visualizingTree === 'name' ? "bg-white shadow-sm text-emerald-600" : "text-slate-500"
                        )}
                      >
                        Chỉ mục Tên
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Bậc 3
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Cân Bằng
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <BTreeVisualizer 
                    root={visualizingTree === 'id' ? idTree.root : nameTree.root} 
                    highlightNodeId={currentStep?.nodeId}
                    highlightKeys={currentStep?.highlightKeys}
                  />
                </div>
              </div>

              {/* Legend */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Nút', color: 'bg-white border-slate-400', desc: 'Chứa các khóa và con trỏ' },
                  { label: 'Khóa', color: 'bg-emerald-50 border-emerald-200', desc: 'Dữ liệu dùng để lập chỉ mục' },
                  { label: 'Nổi bật', color: 'bg-amber-100 border-amber-400', desc: 'Nút hiện tại trong mô phỏng' },
                ].map(item => (
                  <div key={item.label} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-start gap-3">
                    <div className={cn("w-4 h-4 rounded mt-1 border", item.color)}></div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{item.label}</p>
                      <p className="text-[10px] text-slate-500 leading-tight">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col">
                <div className="px-8 py-6 border-b border-slate-100 bg-emerald-50/30">
                  <h2 className="text-lg font-bold text-slate-800">Chèn Hàng Loạt (JSONL)</h2>
                  <p className="text-sm text-slate-500">Dán dữ liệu sinh viên định dạng JSONL (mỗi dòng một đối tượng JSON)</p>
                </div>
                <div className="p-8 space-y-4">
                  <textarea 
                    value={jsonlInput}
                    onChange={(e) => setJsonlInput(e.target.value)}
                    placeholder='{"id": "24522000", "name": "Lê Văn E", "gender": "Nam", "class": "CNTT3"}'
                    className="w-full h-48 p-4 font-mono text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
                  />
                  <div className="flex justify-end gap-3">
                    <button 
                      onClick={() => setJsonlInput('{"id": "24522001", "name": "Lê Văn E", "gender": "Nam", "class": "CNTT3"}\n{"id": "24522002", "name": "Nguyễn Thị F", "gender": "Nữ", "class": "CNTT1"}')}
                      className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      Tải Mẫu
                    </button>
                    <button 
                      onClick={handleInsertJsonl}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-200 active:scale-95"
                    >
                      Xử Lý & Chèn
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 rounded-3xl shadow-xl border border-slate-800 overflow-hidden flex flex-col h-[400px]">
                <div className="px-8 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    </div>
                    <span className="ml-4 text-xs font-mono text-slate-500">students_data.jsonl (Xem Hiện Tại)</span>
                  </div>
                </div>
                <div className="flex-1 overflow-auto p-6 font-mono text-sm">
                  {students.map((s, idx) => (
                    <div key={s.id} className="group flex gap-4 py-1 hover:bg-slate-800/50 px-2 rounded transition-colors">
                      <span className="text-slate-600 w-8 text-right select-none">{idx + 1}</span>
                      <span className="text-emerald-400">{"{"}</span>
                      <span className="text-slate-300">
                        "id": <span className="text-emerald-400">"{s.id}"</span>, 
                        "name": <span className="text-emerald-400">"{s.name}"</span>, 
                        "gender": <span className="text-emerald-400">"{s.gender}"</span>, 
                        "class": <span className="text-emerald-400">"{s.className}"</span>
                      </span>
                      <span className="text-emerald-400">{"}"}</span>
                    </div>
                  ))}
                </div>
                <div className="px-8 py-3 bg-slate-950 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between">
                  <span>UTF-8 • JSONL</span>
                  <span>{students.length} Bản ghi</span>
                </div>
              </div>
            </div>
          )}

          {/* Table of Students */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800">Bản Ghi Đã Lập Chỉ Mục</h2>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{students.length} Sinh viên</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">MSSV</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Họ Tên</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lớp</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map(s => (
                    <tr key={s.id} className="hover:bg-emerald-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono font-bold text-emerald-600">{s.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-700">{s.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">{s.className}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDelete(s.id)}
                          className="text-slate-300 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200 bg-white py-8 px-8">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <GraduationCap size={20} />
            <span className="text-sm font-medium">Hệ thống Quản lý Chỉ mục Sinh viên • Mô phỏng B-Tree</span>
          </div>
          <div className="flex gap-6 text-xs font-bold text-emerald-600 uppercase tracking-widest">
            <a href="#" className="hover:text-emerald-800 transition-colors">Tài liệu</a>
            <a href="#" className="hover:text-emerald-800 transition-colors">Chi tiết Thuật toán</a>
            <a href="#" className="hover:text-emerald-800 transition-colors">Github</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
