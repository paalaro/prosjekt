class Styles {
  constructor(nbul, nbil, nbilLink) {
    this.nbul = {
      listStyleType: 'none',
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      backgroundColor: '#333'
    }

    this.nbil = {
      float: 'left'
    }

    this.nbLink = {
      display: 'block',
      color: 'white',
      textAlign: 'center',
      padding: '14px 16px',
      textAlign: 'none'
    }
  }
}

let styles = new Styles();
export { styles };
