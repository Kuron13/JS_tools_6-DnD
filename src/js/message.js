export class Message {
  constructor(element) {
    if(typeof element === 'string') {
      element = document.querySelector(element);
    }

  this._element = element;
  this.deleteMessage = this.deleteMessage.bind(this)
  }

  deleteMessage(e) {
    e.remove()
  }
}