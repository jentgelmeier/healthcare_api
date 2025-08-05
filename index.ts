import { Patient, PatientResponse, PatientScore, Results } from "./types.ts";

// execution
sortPatients();

// function declarations
async function scorePatients(): Promise<PatientScore[]> {
  const patients: PatientResponse = await getPatients();
  let patientScores: PatientScore[] = [];

  for (let patient of patients.data) {
    let id = patient.patient_id;
    let invalidData = 0;
    let blood = scoreBloodPressure(patient);
    let temp = scoreTemp(patient);
    let age = scoreAge(patient);

    // check for invalid data
    if (blood < 0) {
      invalidData = 1;
      blood = 0;
    }
    if (temp < 0) {
      invalidData = 1;
      temp = 0;
    }
    if (age < 0) {
      invalidData = 1;
      age = 0;
    }

    patientScores.push({ id, blood, temp, age, invalidData });
  }
  console.log(patientScores);
  return patientScores;
}

async function sortPatients(): Promise<Results> {
  const scores = await scorePatients();
  const results: Results = {
    high_risk_patients: [],
    fever_patients: [],
    data_quality_issues: [],
  };

  for (let score of scores) {
    const totalRisk = score.blood + score.temp + score.age;

    if (totalRisk >= 4) {
      results.high_risk_patients.push(score.id);
    }
    if (score.temp > 0) {
      results.fever_patients.push(score.id);
    }
    if (score.invalidData === 1) {
      results.data_quality_issues.push(score.id);
    }
  }
  console.log(results);
  return results;
}

async function getPatients(): Promise<PatientResponse> {
  const response: Response = await fetch(
    "https://assessment.ksensetech.com/api/patients",
    {
      method: "GET",
      headers: {
        "x-api-key": "ak_f873e7a598c2be9d66bbce4272f42c2b977a8e6f41a5a28d",
      },
    }
  );

  const patients: PatientResponse = (await response.json()) as PatientResponse;
  console.log(patients);
  return patients;
}

function scoreBloodPressure(patient: Patient): number {
  const { blood_pressure }: { blood_pressure: string } = patient;

  if (!blood_pressure.match(/\d{1,3}\/\d{1,3}/)) {
    // invalid data
    return -1;
  } else {
    let pressures = blood_pressure.split("/");
    const systolic = Number(pressures[0]);
    const diastolic = Number(pressures[1]);
    if (systolic < 120 && diastolic < 80) {
      return 0;
    } else if (systolic < 130 && diastolic < 80) {
      return 1;
    } else if (systolic < 140 || diastolic < 90) {
      return 2;
    } else {
      return 3;
    }
  }
}

function scoreTemp(patient: Patient): number {
  const { temperature }: { temperature: number | string | null | undefined } =
    patient;

  if (typeof temperature !== "number") {
    // invalid data
    return -1;
  } else {
    if (temperature < 99.6) {
      return 0;
    } else if (temperature < 101) {
      return 1;
    } else {
      return 2;
    }
  }
}

function scoreAge(patient: Patient): number {
  const { age }: { age: number | string | null | undefined } = patient;

  if (typeof age !== "number") {
    // invalid data
    return -1;
  } else {
    if (age < 40) {
      return 0;
    } else if (age <= 65) {
      return 1;
    } else {
      return 2;
    }
  }
}
