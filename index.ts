import {
  NumberPlus,
  Patient,
  PatientResponse,
  PatientScore,
  Results,
  StringPlus,
} from "./types.ts";

// execution
submit();

// function declarations
async function submit(): Promise<void> {
  const results = await getResults();
  console.log("results", results);

  const response: Response = await fetch(
    "https://assessment.ksensetech.com/api/submit-assessment",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "ak_f873e7a598c2be9d66bbce4272f42c2b977a8e6f41a5a28d",
      },
      body: JSON.stringify(results),
    }
  );
  const finalResponse = await response.json();
  console.log("Assessment Results:", finalResponse);
}

async function getResults(): Promise<Results> {
  const scores = await scoreAllPatients();
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

  return results;
}

async function scoreAllPatients(): Promise<PatientScore[]> {
  let patients: PatientResponse;
  let allScores: PatientScore[] = [];
  let page = 1;

  // fetch one page at a time. If the fetch doesn't return the data correctly, fetch again.
  // If it returns the data correctly, fetch the next page until there are no more pages.
  do {
    patients = await fetchPatients(page, 20);
    if (patients.data) {
      console.log("patient raw data", patients);
      allScores = [...allScores, ...scorePatientPage(patients)];
      page++;
    }
  } while (
    patients.pagination === undefined ||
    patients.pagination.hasNext === true
  );

  console.log("patient scores", allScores);
  return allScores;
}

function scorePatientPage(patients: PatientResponse): PatientScore[] {
  let patientScores: PatientScore[] = [];

  for (let patient of patients.data) {
    let id = patient.patient_id;
    let invalidData = 0;
    let blood = scoreBloodPressure(patient);
    let temp = scoreTemp(patient);
    let age = scoreAge(patient);

    // check for invalid data by looking for -1. If so, mark invalidData = 1 and set the invalid score to 0.
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

  return patientScores;
}

async function fetchPatients(
  page: number,
  limit: number
): Promise<PatientResponse> {
  const response = await fetch(
    `https://assessment.ksensetech.com/api/patients?page=${page}&limit=${limit}`,
    {
      method: "GET",
      headers: {
        "x-api-key": "ak_f873e7a598c2be9d66bbce4272f42c2b977a8e6f41a5a28d",
      },
    }
  );

  const patients: PatientResponse = (await response.json()) as PatientResponse;

  return patients;
}

// scoring functions
function scoreBloodPressure(patient: Patient): number {
  const { blood_pressure }: { blood_pressure: StringPlus } = patient;

  if (
    typeof blood_pressure !== "string" ||
    !blood_pressure.match(/\d{1,3}\/\d{1,3}/)
  ) {
    // invalid data
    return -1;
  } else {
    let pressures = blood_pressure.split("/");
    const systolic = Number(pressures[0]);
    const diastolic = Number(pressures[1]);
    if (systolic >= 140 || diastolic >= 90) {
      return 3;
    } else if (systolic >= 130 || diastolic >= 80) {
      return 2;
    } else if (systolic >= 120 && diastolic < 80) {
      return 1;
    } else {
      return 0;
    }
  }
}

function scoreTemp(patient: Patient): number {
  const { temperature }: { temperature: NumberPlus } = patient;

  if (typeof temperature !== "number") {
    // invalid data
    return -1;
  } else {
    if (temperature <= 99.5) {
      return 0;
    } else if (temperature < 101) {
      return 1;
    } else {
      return 2;
    }
  }
}

function scoreAge(patient: Patient): number {
  const { age }: { age: NumberPlus } = patient;

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
