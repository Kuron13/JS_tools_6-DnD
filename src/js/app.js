//import { Message } from "./message";

const mainForm = document.querySelector('.main-form');
const columnAll = Array.from(mainForm.querySelectorAll('.column'));

const itemElements = Array.from(mainForm.querySelectorAll('.message'));

const showFormButtons = Array.from(mainForm.querySelectorAll('.btn-open-form'));


let actualElement;
let firstPlace;
let offsetX, offsetY;
let phantomHtml;
let phantomElement;

const onMouseOver = (e) => {
  console.log(e)

  //actualElement.style.top = e.clientY + 'px'
  //actualElement.style.left = e.clientX + 'px'
  
  actualElement.style.top = e.clientY - offsetY + 'px'
  actualElement.style.left = e.clientX - offsetX + 'px'
  
  //if (e.target.classList.contains('column-content')) {
  //  e.target.append(phantomElement);
  //}
  //else if (e.target.classList.contains('message')) {
  if (e.target.classList.contains('message')) {
    //let insideX = e.clientX - e.target.getBoundingClientRect().left;
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

const onMouseUp = (e) => {
  const mouseUpItem = e.target;
  let itemDrop = mouseUpItem;
  let items;
  let itemsColumn;
  //offsetX = 0;
  //offsetY = 0;

  if (mouseUpItem.classList.contains('column-content')) {
    console.log('Отпущено над колонкой контента')
    items = mouseUpItem;
  } else {
    
    console.log('Отпущено над сообщением или вне колонки')
    itemsColumn = mouseUpItem.closest('.column')  
    
    if (itemsColumn == null) {
      console.log('Отпущено вне колонки')
      items = firstPlace;
    } else {
      items = itemsColumn.querySelector('.column-content');
    }
  }

  if (!mouseUpItem.classList.contains('message')) {
    itemDrop = mouseUpItem.closest('.message');
    console.log('itemDrop', itemDrop)
  }
  
  //const items = mouseUpItem.closest('.column-content');
  console.log('Ближайшая колонка к отпущенной кнопке: ', items)
  console.log('Сообщение, на которое навелись: ', items)
  
  
  
  //let closestMessage = mouseUpItem.closest('.message')
  //let insideY = e.clientY - closestMessage.getBoundingClientRect().top;
  //  if (insideY < closestMessage.offsetHeight / 2) {
  //    items.insertBefore(actualElement, closestMessage);
  //  } else {
  //    items.inserAfter(actualElement, closestMessage);
  //  }


  //items.insertBefore(actualElement, itemDrop)

  items.insertBefore(actualElement, phantomElement)
  
  actualElement.style.top = ''
  actualElement.style.left = ''

  actualElement.classList.remove('item-dragged');
  actualElement = undefined;
  
  document.body.style.cursor = 'default';
  
  document.documentElement.removeEventListener('mouseup', onMouseUp);
  document.documentElement.removeEventListener('mouseover', onMouseOver);

  mainForm.querySelector('.phantom').remove();
}

const onMouseDown = (e) => {
  console.log('Зажали кнопку мыши на: ', e)
  e.preventDefault();
  if (e.target.classList.contains('message')) {
    actualElement = e.target;
  } else {
    if (e.target.classList.contains('btn-delete')) {
      deleteMessage(e);
      return;
    }
    actualElement = e.target.closest('.message');
  }
  firstPlace = actualElement.closest('.column-content')

  actualElement.classList.add('item-dragged')

  document.body.style.cursor = 'grabbing';
    
  document.documentElement.addEventListener('mouseup', onMouseUp);
  document.documentElement.addEventListener('mouseover', onMouseOver);

  offsetX = e.clientX - actualElement.getBoundingClientRect().left;
  offsetY = e.clientY - actualElement.getBoundingClientRect().top;

  phantomHtml = `
    <div class="phantom" style="height:${actualElement.offsetHeight}px;"></div>
  `
  actualElement.insertAdjacentHTML("beforebegin", phantomHtml);
  phantomElement = mainForm.querySelector('.phantom')
}

itemElements.forEach((item) => {
  item.addEventListener('mousedown', onMouseDown);
  item.addEventListener('mouseover', () => {
    item.lastElementChild.hidden = false;
  });
  item.addEventListener('mouseout', () => {
    item.lastElementChild.hidden = true;
  });
});

function showForm(e) {
  const showButton = e.target;

  const htmlForm = `
    <form class='form'>
      <input type='textarea' class="new-message">
      <div class="form-buttons">
        <button type="button" class="btn-add" name="btn-add">Добавить</button>
        <button type="button" class="btn-cancle" name="btn-cancle">Отмена</button>
      </div>
    </form>
  `
  const column = showButton.closest('.column-footer');
  column.insertAdjacentHTML("afterbegin", htmlForm);

  const btnAdd = column.querySelector('.btn-add');
  const btnCancle = column.querySelector('.btn-cancle');

  btnAdd.addEventListener('click', (e) => addMessage(e));
  btnCancle.addEventListener('click', (e) => hiddenForm(e));

  showButton.hidden = true;
}

function hiddenForm(e) {
  const cancleButton = e.target;
  const column = cancleButton.closest('.column-footer');

  column.removeChild(column.querySelector('.form'))
  const showButton = column.querySelector('.btn-open-form');
  showButton.hidden = false;
}

function addMessage(e) {
  const addButton = e.target;
  const column = addButton.closest('.column');
  const content = column.querySelector('.column-content');
  const messageText = column.querySelector('.new-message').value;

  if (messageText != '') {
    const messageHtml = `
      <div class="message">
        <span class='message-text'>${messageText}</span>
        <button type="button" class="btn-delete">Х</button>
      </div>
    `
    content.insertAdjacentHTML("beforeend", messageHtml);
    const newMessage = content.lastElementChild
    newMessage.addEventListener('mousedown', onMouseDown);
    newMessage.lastElementChild.addEventListener('click', deleteMessage)
    newMessage.addEventListener('mouseover', () => {
      newMessage.lastElementChild.hidden = false;
    });
    newMessage.addEventListener('mouseout', () => {
      newMessage.lastElementChild.hidden = true;
    });
  }

  column.querySelector('.form').remove();
  const showButton = column.querySelector('.btn-open-form');
  showButton.hidden = false;
}

function deleteMessage(e) {
  const deleteButton = e.target;
  const message = deleteButton.closest('.message');
  message.remove()
}


showFormButtons.forEach((btn) => {
  btn.addEventListener('click', showForm);
});



//Сохранение значений полей в форме при закрытии страницы
window.addEventListener('beforeunload', () => {
  console.log("Начало записи")
  let formData = {};
  let messages = [];
  console.log('Колонки', mainForm)
  //[...mainForm.elements].forEach((column, columnIndex) => {
  columnAll.forEach((column, columnIndex) => {
    let columnContent = column.querySelector('.column-content')
    console.log('Контент', columnIndex, 'колонки: ', columnContent)
    //console.log('Список сообщений', [...columnContent.elements])

    formData[columnIndex] = formData[columnIndex] || {};
    messages = Array.from(columnContent.querySelectorAll('.message'))
    
    messages.forEach((el, messageIndex) => {
      console.log("Перебираем элементы")
      //if (!el.classList.contains('message')) {
      //  return;
      //}
      
      formData[columnIndex][messageIndex] = formData[columnIndex][messageIndex] || {}
      
      let messageText = el.querySelector('.message-text') 
      formData[columnIndex][messageIndex] = messageText.textContent;
    });

  });
  
  console.log(formData)

  localStorage.setItem('formData', JSON.stringify(formData));
});

//Загрузка сохранённых значений в форму
document.addEventListener('DOMContentLoaded', () => {
  const json = localStorage.getItem('formData');

  let formData;
  
  try {
    formData = JSON.parse(json);
  } catch (error) {
    console.log(error);
  }

  if (formData) {
    console.log(formData)
    
    Object.keys(formData).forEach((columnIndex) => {
      console.log('Колонка номер: ', columnIndex)
      let column = Array.from(mainForm.querySelectorAll('.column-content'))[columnIndex]
      column.replaceChildren();
    
      Object.keys(formData[columnIndex]).forEach((messageIndex) => {
        console.log('Сообщение номер: ', messageIndex)
        let messageText = formData[columnIndex][messageIndex]
        let messageHtml = `
          <div class="message">
            <span class='message-text'>${messageText}</span>
            <button type="button" class="btn-delete" hidden>Х</button>
          </div>
        `
        console.log(column, messageText)
        column.insertAdjacentHTML("beforeend", messageHtml);
        console.log('Вставили сообщение')
        let newMessage = column.lastElementChild
        console.log('Нашли сообщение: ', newMessage)
        newMessage.addEventListener('mousedown', onMouseDown);
        newMessage.lastElementChild.addEventListener('click', deleteMessage)

        newMessage.addEventListener('mouseover', () => {
          newMessage.lastElementChild.hidden = false;
        });
        newMessage.addEventListener('mouseout', () => {
          newMessage.lastElementChild.hidden = true;
        });
      });
    });
  };
});
