export class MeaningBranch<T>{
	labels: string[] = [];
	notes: string[] = [];
	nextLevel: Array<T> = [];
	toString(): string {
		//a keresés miatt van ilyen hülye nevük
		return `{nxtLvl.: ${this.nextLevel}, lbl.: ${this.labels}, nt.: ${this.notes}}`
	}
}