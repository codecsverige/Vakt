export interface VabEntry {
  id: string;
  childName: string;
  startDate: string;
  endDate: string;
  notes?: string;
  reminderOffsets: number[];
  createdAt: string;
  updatedAt: string;
}

export interface MedicalAppointment {
  id: string;
  title: string;
  personName?: string;
  date: string;
  location?: string;
  notes?: string;
  reminderOffsets: number[];
  createdAt: string;
  updatedAt: string;
}

export interface VabEntryInput {
  childName: string;
  startDate: string;
  endDate: string;
  notes?: string;
  reminderOffsets?: number[];
}

export interface MedicalAppointmentInput {
  title: string;
  personName?: string;
  date: string;
  location?: string;
  notes?: string;
  reminderOffsets?: number[];
}
