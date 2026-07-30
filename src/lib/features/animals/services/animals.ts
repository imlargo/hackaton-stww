import { MockService, id, now } from '$lib/core/mock-service';
import type { Animal } from '$lib/types/domain/animal';
import type { CreateAnimalInput, UpdateAnimalInput } from '../types';

export const SEED_ANIMAL_IDS = { gallina: id(), conejo: id(), rana: id() } as const;

const SEED: Animal[] = [
	{
		id: SEED_ANIMAL_IDS.gallina,
		name: 'Gallus gallus domesticus',
		common_name: 'Gallina',
		category: 'Aves de corral',
		care_info: 'Necesita gallinero limpio, agua fresca y alimento balanceado dos veces al día.',
		image_url: null,
		created_at: now()
	},
	{
		id: SEED_ANIMAL_IDS.conejo,
		name: 'Oryctolagus cuniculus',
		common_name: 'Conejo',
		category: 'Mamíferos pequeños',
		care_info: 'Jaula ventilada, heno disponible siempre y control de temperatura.',
		image_url: null,
		created_at: now()
	},
	{
		id: SEED_ANIMAL_IDS.rana,
		name: 'Dendrobates truncatus',
		common_name: 'Rana venenosa dorada',
		category: 'Anfibios',
		care_info:
			'Terrario húmedo con vegetación densa; requiere manejo especializado y no manipulación directa.',
		image_url: null,
		created_at: now()
	}
];

export class AnimalService extends MockService<Animal> {
	constructor() {
		super(SEED);
	}

	async list() {
		const all = await this.findAll();
		return [...all].sort((a, b) => a.name.localeCompare(b.name));
	}

	create(input: CreateAnimalInput) {
		return this.insert({
			id: id(),
			name: input.name,
			common_name: input.common_name ?? null,
			category: input.category ?? null,
			care_info: input.care_info ?? null,
			image_url: input.image_url ?? null,
			created_at: now()
		});
	}

	update(animalId: string, input: UpdateAnimalInput) {
		return this.patch(animalId, input);
	}

	remove(animalId: string) {
		return this.destroy(animalId);
	}
}

export const animalService = new AnimalService();
