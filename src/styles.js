class Nbul {
  constructor(listStyleType, margin, padding, overflow, backgroundColor) {
    this.listStyleType = 'none';
    this.margin = 0;
    this.padding = 0;
    this.overflow = 'hidden';
    this.backgroundColor = '#333';
  }
}

class Nbil {
  constructor(float) {
    this.float = 'left';
  }
}

class NbilLink {
  constructor(display, color, textAlign, padding, textDecoration) {
    this.display = 'block';
    this.color = 'white';
    this.textAlign = 'center';
    this.padding = '14px 16px';
    this.textAlign = 'none';
  }
}

let nbul = new Nbul();
let nbil = new Nbil();
let nbilLink = new NbilLink();

export { nbul };
export { nbil };
export { nbilLink };
