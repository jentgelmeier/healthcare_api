export interface Patient {
  patient_id: string;
  age: number;
  gender: string;
  blood_pressure: string;
  temperature: number;
  visit_date: Date;
  diagnosis: string;
  medications: string;
}

export interface PatientResponse {
  data: Patient[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: Boolean;
    hasPrevious: Boolean;
  };
  metadata: {
    timestamp: Date;
    version: string;
    requestId: string;
  };
}

export interface PatientScore {
  id: string;
  blood: number;
  temp: number;
  age: number;
  invalidData: number;
}

export interface Results {
  high_risk_patients: string[];
  fever_patients: string[];
  data_quality_issues: string[];
}
