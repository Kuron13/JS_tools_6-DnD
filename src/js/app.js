const mainForm = document.querySelector('.main-form');
const columns = Array.from(mainForm.querySelectorAll('.column'));
const messages = Array.from(mainForm.querySelectorAll('.message'));

let columnObjects = []
let actualElement;
let offsetX, offsetY;
let phantomElement;
let firstPlace;

class Message {
    constructor(element) {
        if(typeof element === 'string') {
          element = document.querySelector(element);
        }

        this._element = element;
        
        this.initEvents = this.initEvents.bind(this)
        this.initEvents();
    }

    initEvents() {
        this._element.addEventListener('mousedown', this.onMouseDown.bind(this));
        this._element.addEventListener('mouseover', this.showDeleteButton.bind(this));
        this._element.addEventListener('mouseout', this.hideDeleteButton.bind(this));
    }

    onMouseDown(e) {
        e.preventDefault();

        if (e.target.classList.contains('btn-delete')) {
            this.deleteMessage(e);
            return;
        }
        actualElement = e.target.closest('.message') || e.target;
        firstPlace = actualElement.closest('.column-content')

        actualElement.classList.add('item-dragged')

        document.body.style.cursor = 'grabbing';
    
        document.documentElement.addEventListener('mouseup', this.onMouseUp);
        document.documentElement.addEventListener('mouseover', this.onMouseOver);

        offsetX = e.clientX - actualElement.getBoundingClientRect().left;
        offsetY = e.clientY - actualElement.getBoundingClientRect().top;

        const phantomHtml = `
          <div class="phantom" style="height:${actualElement.offsetHeight}px;"></div>
        `
        actualElement.insertAdjacentHTML("beforebegin", phantomHtml);
        phantomElement = mainForm.querySelector('.phantom')

    };

    onMouseUp = (e) => {
      const mouseUpItem = e.target;
      let items;
      let itemsColumn;
  
      if (mouseUpItem.classList.contains('column-content')) {
        items = mouseUpItem;
      } else {
        itemsColumn = mouseUpItem.closest('.column')  
        
        if (itemsColumn == null) {
          items = firstPlace;
        } else {
          items = itemsColumn.querySelector('.column-content');
        }
      }
    
      items.insertBefore(actualElement, phantomElement)
    
      actualElement.style.top = ''
      actualElement.style.left = ''
  
      actualElement.classList.remove('item-dragged');
      actualElement = undefined;
    
      document.body.style.cursor = 'default';
    
      document.documentElement.removeEventListener('mouseup', this.onMouseUp);
      document.documentElement.removeEventListener('mouseover', this.onMouseOver);
  
      mainForm.querySelector('.phantom').remove();
    }
    
    onMouseOver = (e) => {
      console.log(e)
  
      actualElement.style.top = e.clientY - offsetY + 'px'
      actualElement.style.left = e.clientX - offsetX + 'px'
      
      if (e.target.classList.contains('message')) {
        let insideY = e.clientY - e.target.getBoundingClientRect().top;
        if (insideY < e.target.offsetHeight / 2) {
          e.target.before(phantomElement);
        } else {
          e.target.after(phantomElement);
        }
      } else if (e.target.classList.contains('column-header')) {
        let column = e.target.closest('.column')
        let columnContent = column.querySelector('.column-content')
        columnContent.prepend(phantomElement);
      }
    }

    deleteMessage(e) {
        const message = e.target.closest('.message');
        message.remove();
    }

    showDeleteButton(e) {
        console.log(e.target)
        const message = e.target.closest('.message') || e.target;
        message.lastElementChild.hidden = false;
    }

    hideDeleteButton(e) {
        const message = e.target.closest('.message') || e.target;
        message.lastElementChild.hidden = true;
    }

}


class Column {
    constructor(element) {
        if(typeof element === 'string') {
          element = document.querySelector(element);
        }

        this._element = element;

        this.showButton = this._element.querySelector('.btn-open-form');
        
        this.hiddenForm = this.hiddenForm.bind(this)
 
        this.initEvents = this.initEvents.bind(this)
        this.initEvents();
    }

    initEvents() {
        this.showButton.addEventListener('click', this.showForm.bind(this));
    }

    showForm() {
        const column = this._element.querySelector('.column-footer');

        const htmlForm = `
          <form class='form'>
            <input type='textarea' class="new-message">
            <div class="form-buttons">
              <button type="button" class="btn-add" name="btn-add">Добавить</button>
              <button type="button" class="btn-cancle" name="btn-cancle">Отмена</button>
            </div>
          </form>
        `
        column.insertAdjacentHTML("afterbegin", htmlForm);

        const btnAdd = column.querySelector('.btn-add');
        const btnCancle = column.querySelector('.btn-cancle');

        btnAdd.addEventListener('click', () => this.addMessage());
        btnCancle.addEventListener('click', () => this.hiddenForm());

        this.showButton.hidden = true;

    }

    hiddenForm() {    
      this._element.querySelector('.form').remove()
      this.showButton.hidden = false;
    }

    addMessage() {
        const column = this._element.querySelector('.column-content');
        const messageText = this._element.querySelector('.new-message').value;
        this.createMessage(column, messageText)
        this.hiddenForm();
    }

    createMessage(column, messageText) {
        const messageHtml = `
            <div class="message">
                <span class='message-text'>${messageText}</span>
                <button type="button" class="btn-delete" hidden>Х</button>
            </div>
        `;
        column.insertAdjacentHTML('beforeend', messageHtml);
        const newMessage = column.lastElementChild;

        const message = new Message(newMessage)
    }
}


class Form {
  constructor(element) {
    if(typeof element === 'string') {
      element = document.querySelector(element);
    }
  }
  
  //Сохранение сообщений при закрытии страницы
  saveData() {
    let formData = {};
    const messages = Array.from(columnContent.querySelectorAll('.message'));
  
    columns.forEach((column, columnIndex) => {
      let columnContent = column.querySelector('.column-content')
  
      formData[columnIndex] = formData[columnIndex] || {};
        
      messages.forEach((el, messageIndex) => {
  
        formData[columnIndex][messageIndex] = formData[columnIndex][messageIndex] || {}
        
        let messageText = el.querySelector('.message-text') 
        formData[columnIndex][messageIndex] = messageText.textContent;
      });
  
    });
  
    localStorage.setItem('formData', JSON.stringify(formData));
  };


  //Загрузка сохранённых сообщений в колонки
  loadData() {
    const json = localStorage.getItem('formData');
  
    let formData;
    let columnContent;
    let column;
    let messageText;
    
    try {
      formData = JSON.parse(json);
    } catch (error) {
      console.log(error);
    }
  
    if (formData) {
      Object.keys(formData).forEach((columnIndex) => {
        columnContent = Array.from(mainForm.querySelectorAll('.column-content'))[columnIndex]
        columnContent.replaceChildren();
        column = columnObjects[columnIndex]
      
        Object.keys(formData[columnIndex]).forEach((messageIndex) => {
          messageText = formData[columnIndex][messageIndex]
          column.createMessage(columnContent, messageText)
        });
      });
    };
  };
}


// Инициализация
window.addEventListener('DOMContentLoaded', () => {
    const form = new Form(mainForm);
    columns.forEach((columnInst) => {
      const columnObject = new Column(columnInst);
      columnObjects.push(columnObject)
    })
    
    messages.forEach((messageInst) => {
      const message = new Message(messageInst)
    })

    window.addEventListener('beforeunload', () => {
        form.saveData();
    });
    form.loadData();
});
