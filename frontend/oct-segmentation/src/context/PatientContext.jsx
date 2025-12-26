import React, { createContext, useContext, useState, useEffect } from 'react';

const PatientContext = createContext();

// Dữ liệu mẫu ban đầu
const INITIAL_PATIENTS = [
  { 
    id: 'BN001', name: 'Nguyễn Văn A', age: 65, gender: 'Nam', phone: '0988.xxx.xxx', lastVisit: '2025-02-15',
    history: [] 
  },
  { 
    id: 'BN002', name: 'Trần Thị B', age: 58, gender: 'Nữ', phone: '0912.xxx.xxx', lastVisit: '2025-02-14',
    history: [] 
  },
];

export const PatientProvider = ({ children }) => {
  // Thử lấy dữ liệu từ LocalStorage nếu có, không thì dùng mẫu
  const [patients, setPatients] = useState(() => {
    const saved = localStorage.getItem('patients_data');
    return saved ? JSON.parse(saved) : INITIAL_PATIENTS;
  });

  // Tự động lưu vào LocalStorage mỗi khi dữ liệu thay đổi (F5 không mất)
  useEffect(() => {
    localStorage.setItem('patients_data', JSON.stringify(patients));
  }, [patients]);

  // Hàm 1: Thêm bệnh nhân mới
  const addPatient = (newPatient) => {
    setPatients([newPatient, ...patients]);
  };

  // Hàm 2: Lưu kết quả khám (QUAN TRỌNG)
  const addMedicalRecord = (patientId, record) => {
    setPatients(prevPatients => prevPatients.map(p => {
      if (p.id === patientId) {
        return {
          ...p,
          lastVisit: record.date, // Cập nhật ngày khám cuối
          history: [record, ...p.history] // Thêm kết quả vào đầu lịch sử
        };
      }
      return p;
    }));
  };

  return (
    <PatientContext.Provider value={{ patients, addPatient, addMedicalRecord }}>
      {children}
    </PatientContext.Provider>
  );
};

export const usePatients = () => useContext(PatientContext);