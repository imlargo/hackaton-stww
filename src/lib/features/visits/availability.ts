// Disponibilidad y cronograma de Unergy — ver requerimientos.md: "Ver disponibilidad
// y cronograma" y "Ver a dónde irá Unergy". Datos mockeados de la agenda de brigadas.
export interface AvailabilitySlot {
	date: string;
	region: string;
	capacityTotal: number;
}

export const AVAILABILITY_SLOTS: AvailabilitySlot[] = [
	{ date: '2026-08-15', region: 'Cali · El Roble', capacityTotal: 1 },
	{ date: '2026-08-22', region: 'Popayán · Buenavista', capacityTotal: 1 },
	{ date: '2026-09-05', region: 'Palmira', capacityTotal: 2 },
	{ date: '2026-09-19', region: 'Yumbo', capacityTotal: 1 },
	{ date: '2026-10-03', region: 'Cali', capacityTotal: 2 },
	{ date: '2026-10-17', region: 'Popayán', capacityTotal: 1 },
	{ date: '2026-11-07', region: 'Buga', capacityTotal: 1 }
];
