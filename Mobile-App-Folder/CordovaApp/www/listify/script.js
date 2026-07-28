(function () {
  const STORAGE_KEY = 'listify-data';

  // ── State ──
  let data = loadData();

  // ── DOM refs ──
  const listNameInput = document.getElementById('list-name-input');
  const createListBtn = document.getElementById('create-list-btn');
  const listsArea = document.getElementById('lists-area');
  const emptyState = document.getElementById('empty-state');

  // ── Storage ──
  function loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  // ── Render ──
  function render() {
    listsArea.innerHTML = '';

    if (data.length === 0) {
      emptyState.style.display = 'block';
      return;
    }
    emptyState.style.display = 'none';

    data.forEach(function (list, listIdx) {
      const card = document.createElement('div');
      card.className = 'list-card';

      // ── Header ──
      const header = document.createElement('div');
      header.className = 'list-card-header';

      const titleWrap = document.createElement('div');
      const title = document.createElement('h3');
      title.textContent = list.name;
      const count = document.createElement('span');
      count.className = 'list-count';
      var doneCount = list.items.filter(function (it) { return it.done; }).length;
      count.textContent = doneCount + '/' + list.items.length + ' done';

      titleWrap.appendChild(title);
      titleWrap.appendChild(count);

      const delListBtn = document.createElement('button');
      delListBtn.className = 'delete-list-btn';
      delListBtn.textContent = '🗑️';
      delListBtn.title = 'Delete list';
      delListBtn.addEventListener('click', function () {
        if (confirm('Delete "' + list.name + '"?')) {
          data.splice(listIdx, 1);
          saveData();
          render();
        }
      });

      header.appendChild(titleWrap);
      header.appendChild(delListBtn);
      card.appendChild(header);

      // ── Items ──
      const itemsDiv = document.createElement('div');
      itemsDiv.className = 'list-items';

      // Add item row
      const addRow = document.createElement('div');
      addRow.className = 'add-item-row';

      const itemInput = document.createElement('input');
      itemInput.type = 'text';
      itemInput.placeholder = 'Add an item...';
      itemInput.maxLength = 80;

      const addBtn = document.createElement('button');
      addBtn.textContent = 'Add';
      addBtn.addEventListener('click', function () {
        var text = itemInput.value.trim();
        if (!text) return;
        list.items.push({ text: text, done: false });
        itemInput.value = '';
        saveData();
        render();
      });

      // Enter key support
      itemInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { addBtn.click(); }
      });

      addRow.appendChild(itemInput);
      addRow.appendChild(addBtn);
      itemsDiv.appendChild(addRow);

      // Item list
      if (list.items.length > 0) {
        var ul = document.createElement('ul');
        ul.className = 'item-list';

        list.items.forEach(function (item, itemIdx) {
          var li = document.createElement('li');

          var check = document.createElement('input');
          check.type = 'checkbox';
          check.className = 'item-check';
          check.checked = item.done;
          check.addEventListener('change', function () {
            item.done = check.checked;
            saveData();
            render();
          });

          var text = document.createElement('span');
          text.className = 'item-text' + (item.done ? ' done' : '');
          text.textContent = item.text;

          var delBtn = document.createElement('button');
          delBtn.className = 'delete-item-btn';
          delBtn.textContent = '✕';
          delBtn.title = 'Remove item';
          delBtn.addEventListener('click', function () {
            list.items.splice(itemIdx, 1);
            saveData();
            render();
          });

          li.appendChild(check);
          li.appendChild(text);
          li.appendChild(delBtn);
          ul.appendChild(li);
        });

        itemsDiv.appendChild(ul);
      }

      card.appendChild(itemsDiv);
      listsArea.appendChild(card);
    });
  }

  // ── Create list ──
  createListBtn.addEventListener('click', function () {
    var name = listNameInput.value.trim();
    if (!name) {
      listNameInput.focus();
      return;
    }
    data.push({ name: name, items: [] });
    listNameInput.value = '';
    saveData();
    render();
    // Scroll to the new list
    var cards = listsArea.querySelectorAll('.list-card');
    if (cards.length) {
      cards[cards.length - 1].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });

  listNameInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { createListBtn.click(); }
  });

  // ── Initial render ──
  render();
})();
