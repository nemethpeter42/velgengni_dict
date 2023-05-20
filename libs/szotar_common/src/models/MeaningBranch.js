export class MeaningBranch {
    labels = [];
    notes = [];
    nextLevel = [];
    toString() {
        //a keresés miatt van ilyen hülye nevük
        return `{nxtLvl.: ${this.nextLevel}, lbl.: ${this.labels}, nt.: ${this.notes}}`;
    }
}
