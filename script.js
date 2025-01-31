document.addEventListener('DOMContentLoaded', () => {
  const loginContainer = document.getElementById('loginContainer');
  const appContainer = document.getElementById('appContainer');
  const loginForm = document.getElementById('loginForm');
  const userIcon = document.getElementById('userIcon');
  const userInitial = document.getElementById('userInitial');
  const profileModal = document.getElementById('profileModal');
  const closeProfileModal = document.getElementById('closeProfileModal');
  const profileForm = document.getElementById('profileForm');
  const profileNameInput = document.getElementById('profileName');
  const profileRoleInput = document.getElementById('profileRole');

  // Existing member initialization
  const members = JSON.parse(localStorage.getItem('members')) || [];

  // Remove any existing admin accounts to prevent duplicates
  const adminIndex = members.findIndex(m => m.email === 'teachermarcial94@gmail.com');
  if (adminIndex > -1) {
    members.splice(adminIndex, 1);
  }

  // Always ensure the admin account exists with correct privileges
  members.push({
    id: 1,
    name: 'Admin',
    email: 'teachermarcial94@gmail.com',
    password: 'Delarosa94',
    role: 'admin'
  });
  localStorage.setItem('members', JSON.stringify(members));

  // Check if user is already logged in
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (currentUser) {
    showApp();
    userInitial.textContent = currentUser.name.charAt(0).toUpperCase();
    profileNameInput.value = currentUser.name;
    profileRoleInput.value = currentUser.role;
    updateUIForRole(currentUser.role);
  }

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = loginForm.email.value;
    const password = loginForm.password.value;

    const user = members.find(m => m.email === email && m.password === password);
    if (user) {
      // Ensure role is properly set
      if (email === 'teachermarcial94@gmail.com' && password === 'Delarosa94') {
        user.role = 'admin';
      }
      localStorage.setItem('currentUser', JSON.stringify(user));
      showApp();
      userInitial.textContent = user.name.charAt(0).toUpperCase();
      profileNameInput.value = user.name;
      profileRoleInput.value = user.role;
      updateUIForRole(user.role);
      
      // Update withdraw button visibility immediately
      const withdrawBtn = document.getElementById('withdrawBtn');
      if (withdrawBtn) {
        withdrawBtn.style.display = user.role === 'admin' ? 'block' : 'none';
      }
    } else {
      alert('Credenciales inválidas');
    }
  });

  function updateUIForRole(role) {
    const memberElements = document.querySelectorAll('.member-card .member-actions');
    const addMemberBtn = document.getElementById('addMemberBtn');
    const withdrawBtn = document.getElementById('withdrawBtn');

    if (role === 'admin') {
      memberElements.forEach(element => {
        element.style.display = 'flex';
      });
      addMemberBtn.style.display = 'block';
      withdrawBtn.style.display = 'block';
    } else {
      memberElements.forEach(element => {
        element.style.display = 'none';
      });
      addMemberBtn.style.display = 'none';
      withdrawBtn.style.display = 'none';
    }
  }

  userIcon.addEventListener('dblclick', toggleProfileMenu);

  document.addEventListener('click', (e) => {
    const menu = document.getElementById('profileMenu');
    const icon = document.getElementById('userIcon');
    if (!icon.contains(e.target)) {
      menu.style.display = 'none';
    }
  });

  function toggleProfileMenu(e) {
    e.stopPropagation();
    const menu = document.getElementById('profileMenu');
    menu.style.display = menu.style.display === 'none' || !menu.style.display ? 'block' : 'none';
  }

  window.showProfile = () => {
    const profileModal = document.getElementById('profileModal');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (currentUser) {
      document.getElementById('profileName').value = currentUser.name;
      document.getElementById('profileRole').value = currentUser.role;
      
      // Show/hide admin-specific elements
      const adminOnlyElements = document.querySelectorAll('.admin-only');
      adminOnlyElements.forEach(element => {
        element.style.display = currentUser.role === 'admin' ? 'block' : 'none';
      });
      
      profileModal.style.display = 'block';
    }

    document.getElementById('profileMenu').style.display = 'none';
  };

  window.logout = () => {
    localStorage.removeItem('currentUser');
    window.location.reload();
  };

  profileForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const updatedName = document.getElementById('profileName').value;

    currentUser.name = updatedName;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    document.getElementById('userInitial').textContent = updatedName.charAt(0).toUpperCase();

    const memberIndex = members.findIndex(m => m.id === currentUser.id);
    if (memberIndex !== -1) {
      members[memberIndex].name = updatedName;
      localStorage.setItem('members', JSON.stringify(members));
    }

    document.getElementById('profileModal').style.display = 'none';
    alert('Perfil actualizado exitosamente');
  });

  function showApp() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
      loginContainer.style.display = 'none';
      appContainer.style.display = 'block';
      userInitial.textContent = currentUser.name.charAt(0).toUpperCase();
      updateUIForRole(currentUser.role);
      updateWithdrawButtonVisibility();
      document.getElementById('profileMenu').innerHTML = `
        <button onclick="showProfile()">Ver Perfil</button>
        ${currentUser.role === 'admin' ? `<button onclick="handleWithdraw()">Retiro de Dinero</button>` : ''}
        <button onclick="logout()">Cerrar Sesión</button>
      `;
    }
    initializeApp();
  }

  function updateWithdrawButtonVisibility() {
    const withdrawBtn = document.getElementById('withdrawBtn');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (withdrawBtn && currentUser) {
      withdrawBtn.style.display = currentUser.role === 'admin' ? 'block' : 'none';
    }
  }

  window.handleWithdraw = () => {
    const totalSales = parseFloat(document.getElementById('totalSales').textContent.replace('$', '')) || 0;
    if (totalSales > 0) {
      const withdrawalAmount = prompt(`¿Cuánto desea retirar? Total vendido: $${totalSales}`);
      const amount = parseFloat(withdrawalAmount);
      if (amount > 0 && amount <= totalSales) {
        addTransaction('sale', 'Retiro de efectivo', 1, amount);
        updateTotalAfterWithdrawal(amount);
      } else {
        alert('Monto inválido');
      }
    } else {
      alert('No hay ventas para retirar');
    }
  };

  function updateTotalAfterWithdrawal(amount) {
    const totalSalesElement = document.getElementById('totalSales');
    const currentTotal = parseFloat(totalSalesElement.textContent.replace('$', ''));
    const newTotal = currentTotal - amount;
    totalSalesElement.textContent = `$${newTotal.toFixed(2)}`;
  }

  function initializeApp() {
    const tabs = document.querySelectorAll('.tab-btn');
    const sections = document.querySelectorAll('.section');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        sections.forEach(s => s.classList.remove('active'));

        tab.classList.add('active');

        const sectionId = tab.dataset.section;
        document.getElementById(sectionId).classList.add('active');

        updateOrderCount();
      });
    });

    const withdrawBtn = document.getElementById('withdrawBtn');
    withdrawBtn.addEventListener('click', () => {
      const totalSales = parseFloat(document.getElementById('totalSales').textContent.replace('$', '')) || 0;
      if (totalSales > 0) {
        const withdrawalAmount = prompt(`¿Cuánto desea retirar? Total vendido: $${totalSales}`);
        const amount = parseFloat(withdrawalAmount);
        if (amount > 0 && amount <= totalSales) {
          addTransaction('sale', 'Retiro de efectivo', 1, amount);
          updateTotalAfterWithdrawal(amount);
        } else {
          alert('Monto inválido');
        }
      } else {
        alert('No hay ventas para retirar');
      }
    });

    const addProductBtn = document.getElementById('addProductBtn');
    addProductBtn.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('inventoryModal').style.display = 'block';
      resetInventoryForm();
    });

    const inventoryModalCloseBtn = document.getElementById('closeInventoryModal');
    inventoryModalCloseBtn.addEventListener('click', () => {
      document.getElementById('inventoryModal').style.display = 'none';
    });

    const newOrderModal = document.getElementById('newOrderModal');
    const newOrderBtn = document.getElementById('newOrderBtn');
    newOrderBtn.addEventListener('click', () => {
      newOrderModal.style.display = 'block';
      updateProductSelect();
    });

    const closeBtns = document.querySelectorAll('.close');
    closeBtns.forEach(btn => {
      btn.addEventListener('click', (event) => {
        const modal = event.currentTarget.closest('.modal');
        modal.style.display = 'none';
        resetOrderForm();
      });
    });

    let currentOrderItems = [];
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
    let archivedOrders = JSON.parse(localStorage.getItem('archivedOrders')) || [];
    let showingArchived = false;

    function saveData() {
      localStorage.setItem('orders', JSON.stringify(orders));
      localStorage.setItem('inventory', JSON.stringify(inventory));
      localStorage.setItem('archivedOrders', JSON.stringify(archivedOrders));
    }

    const inventoryForm = document.getElementById('inventoryForm');
    inventoryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(inventoryForm);
      const newProduct = {
        id: Date.now(),
        name: formData.get('productName'),
        buyPrice: parseFloat(formData.get('buyPrice')),
        sellPrice: parseFloat(formData.get('sellPrice')),
        quantity: parseInt(formData.get('quantity')),
        imageUrl: formData.get('imageUrl'),
      };

      const fileInput = inventoryForm.querySelector('input[name="mainImage"]');
      if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onloadend = function() {
          newProduct.imageUrl = reader.result;
          finishAddingProduct(newProduct);
        }
        reader.readAsDataURL(file);
      } else {
        newProduct.imageUrl = 'https://via.placeholder.com/150'; // Default image
        finishAddingProduct(newProduct);
      }
    });

    function finishAddingProduct(newProduct) {
      inventory.push(newProduct);
      addInventoryItem(newProduct);
      inventoryForm.reset();
      updateTotalProductsCount();
      updateTotalInvested();
      document.getElementById('inventoryModal').style.display = 'none';
      saveData();
    }

    function resetOrderForm() {
      document.getElementById('newOrderForm').reset();
      currentOrderItems = [];
      updateOrderSummary();
    }

    function resetInventoryForm() {
      document.getElementById('inventoryForm').reset();
    }

    document.getElementById('newOrderForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const customerName = document.querySelector('[name="customerName"]').value;
      const customerPhone = document.querySelector('[name="customerPhone"]').value;

      const order = {
        id: Date.now(),
        customer: customerName,
        phone: customerPhone,
        items: [...currentOrderItems],
        total: currentOrderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        status: 'orders',
        date: new Date(),
      };

      addOrderToDisplay(order);
      updateInventoryGrid();
      updateDashboardStats();
      orders.push(order);
      saveData();
      newOrderModal.style.display = 'none';
      resetOrderForm();
    });

    const addToOrderBtn = document.getElementById('addToOrderBtn');
    addToOrderBtn.addEventListener('click', () => {
      const productSelect = document.getElementById('productSelect');
      const quantityInput = document.querySelector('[name="quantity"]');
      const productId = productSelect.value;
      const quantity = parseInt(quantityInput.value);

      if (productId && quantity > 0) {
        const product = inventory.find(p => p.id === parseInt(productId));
        if (product && product.quantity >= quantity) {
          const orderItem = {
            id: product.id,
            name: product.name,
            price: product.sellPrice,
            quantity: quantity
          };
          currentOrderItems.push(orderItem);
          updateOrderSummary();
          quantityInput.value = 0;
        } else {
          alert('No hay suficiente stock disponible');
        }
      }
    });

    function updateOrderSummary() {
      const orderItemsDiv = document.getElementById('orderItems');
      const orderTotalSpan = document.getElementById('orderTotal');
      
      orderItemsDiv.innerHTML = currentOrderItems.map(item => `
        <div class="order-item">
          <span>${item.name} x ${item.quantity}</span>
          <span>$${(item.price * item.quantity).toFixed(2)}</span>
          <button type="button" class="remove-item" onclick="removeOrderItem(${currentOrderItems.indexOf(item)})">&times;</button>
        </div>
      `).join('');
      
      const total = currentOrderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      orderTotalSpan.textContent = total.toFixed(2);
    }

    window.removeOrderItem = (index) => {
      currentOrderItems.splice(index, 1);
      updateOrderSummary();
    };

    function createOrderCard(order) {
      const orderCard = document.createElement('div');
      orderCard.className = 'order-card';
      orderCard.dataset.id = order.id;
      orderCard.innerHTML = `
        <div class="order-header">
          <span class="order-id">#${order.id}</span>
          <select class="order-status-select" onchange="updateOrderStatus(${order.id}, this.value)" ${order.archived ? 'disabled' : ''}>
            <option value="orders" ${order.status === 'orders' ? 'selected' : ''}>Pendiente</option>
            <option value="in-progress" ${order.status === 'in-progress' ? 'selected' : ''}>En Progreso</option>
            <option value="delivering" ${order.status === 'delivering' ? 'selected' : ''}>Enviando</option>
            <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completado</option>
          </select>
        </div>
        <div class="order-details">
          <p><strong>Cliente:</strong> ${order.customer}</p>
          <p><strong>Teléfono:</strong> ${order.phone}</p>
          <ul class="order-items-list">
            ${order.items.map(item => `
              <li>${item.name} x ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}</li>
            `).join('')}
          </ul>
          <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
        </div>
        ${order.status === 'completed' ? `
          <div class="order-actions">
            <button class="edit-order-btn" onclick="editOrder(${order.id})">Editar</button>
            <button class="delete-order-btn" onclick="showDeleteConfirmation(${order.id})">Eliminar</button>
            ${!order.archived ? `
              <button class="archive-btn" onclick="showArchiveConfirmation(${order.id})">Archivar</button>
            ` : `
              <button class="unarchive-btn" onclick="showUnarchiveConfirmation(${order.id})">Desarchivar</button>
            `}
          </div>
        ` : ''}
      `;
      return orderCard;
    }

    window.updateOrderStatus = (orderId, newStatus) => {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        order.status = newStatus;
        
        // Remove the order card from its current location
        const orderCard = document.querySelector(`.order-card[data-id="${orderId}"]`);
        if (orderCard) {
          orderCard.remove();
        }
        
        // Create a new order card and add it to the correct section
        const targetContainer = document.querySelector(`#${newStatus} .orders-container`);
        if (targetContainer) {
          const newOrderCard = createOrderCard(order);
          targetContainer.prepend(newOrderCard);
        }
        
        updateOrderCount();
        saveData();
      }
    };

    function addOrderToDisplay(order) {
      const orderCard = createOrderCard(order);
      // Find the correct section based on order status
      const targetSection = document.querySelector(`#${order.status} .orders-container`);
      if (targetSection) {
        targetSection.appendChild(orderCard);
      }
      
      updateOrderCount();
      saveData();
    }

    function updateOrderCount() {
      // Only count orders that aren't completed
      const activeOrders = orders.filter(order => order.status !== 'completed').length;
      document.getElementById('totalOrders').textContent = activeOrders;
    }

    const inventoryGrid = document.getElementById('inventoryGrid');

    window.addInventoryItem = (product) => {
      const item = document.createElement('div');
      item.className = 'inventory-item small';
      item.dataset.id = product.id;
      item.innerHTML = `
        <img src="${product.imageUrl}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/150'" ondblclick="openGallery(${product.id})">
        <div class="inventory-item-details">
          <h3>${product.name}</h3>
          <p>Precio de compra: $${product.buyPrice.toFixed(2)}</p>
          <p>Precio de venta: $${product.sellPrice.toFixed(2)}</p>
          <p>Cantidad: ${product.quantity}</p>
          <p>Ganancia por unidad: $${(product.sellPrice - product.buyPrice).toFixed(2)}</p>
        </div>
        <div class="inventory-item-options">
          <button class="delete-btn" onclick="confirmDelete(${product.id})">Eliminar</button>
          <button class="edit-btn" onclick="confirmEdit(${product.id})">Editar</button>
        </div>
      `;
      inventoryGrid.appendChild(item);
    }

    window.deleteProduct = (id) => {
      const index = inventory.findIndex(p => p.id === id);
      if (index > -1) {
        inventory.splice(index, 1);
        updateInventoryGrid();
        updateTotalProductsCount();
        saveData();
        document.querySelector('.floating-confirm')?.remove();
      }
    };

    window.confirmDelete = (id) => {
      const confirmDiv = document.createElement('div');
      confirmDiv.className = 'floating-confirm';
      confirmDiv.innerHTML = `
        <div class="floating-confirm-content">
          <h3>Confirmar Eliminación</h3>
          <p>¿Estás seguro de que deseas eliminar este producto?</p>
          <div class="confirm-buttons">
            <button onclick="deleteProduct(${id})" class="confirm-btn">Sí, Eliminar</button>
            <button onclick="this.closest('.floating-confirm').remove()" class="cancel-btn">Cancelar</button>
          </div>
        </div>
      `;
      document.body.appendChild(confirmDiv);
    };

    window.confirmEdit = (id) => {
      const product = inventory.find(p => p.id === id);
      if (product) {
        document.getElementById('editModal').style.display = 'block';
        const editForm = document.getElementById('editForm');
        editForm.productName.value = product.name;
        editForm.buyPrice.value = product.buyPrice;
        editForm.sellPrice.value = product.sellPrice;
        editForm.quantity.value = product.quantity;
        document.getElementById('imageUrlEdit').value = product.imageUrl;

        const saveProductBtn = document.getElementById('saveProductBtn');
        saveProductBtn.onclick = (e) => {
          e.preventDefault();
          const updatedProduct = {
            id: product.id,
            name: editForm.productName.value,
            buyPrice: parseFloat(editForm.buyPrice.value),
            sellPrice: parseFloat(editForm.sellPrice.value),
            quantity: parseInt(editForm.quantity.value) || 0,
            imageUrl: editForm.imageUrl.value || product.imageUrl 
          };

          const index = inventory.findIndex(p => p.id === product.id);
          if (index > -1) {
            inventory[index] = updatedProduct;
            updateInventoryGrid();
            updateTotalProductsCount();
            document.getElementById('editModal').style.display = 'none';
            saveData();
          }
        };
      }
    };

    function updateInventoryGrid() {
      inventoryGrid.innerHTML = '';
      inventory.forEach(product => {
        addInventoryItem(product);
      });
      updateTotalInvested();
    }

    function updateTotalProductsCount() {
      const totalProducts = inventory.reduce((sum, product) => sum + product.quantity, 0);
      document.getElementById('totalProducts').textContent = totalProducts;
    }

    const updateTotalInvested = () => {
      const totalInvested = inventory.reduce((sum, product) =>
        sum + (product.buyPrice * product.quantity), 0);
      
      document.getElementById('totalInvested').textContent = `$${(totalInvested).toFixed(2)}`;
    };

    const updateProductSelect = () => {
      const productSelect = document.getElementById('productSelect');
      productSelect.innerHTML = '<option value="">Seleccionar producto</option>';
      inventory.forEach(product => {
        if (product.quantity > 0) {
          productSelect.innerHTML += `
            <option value="${product.id}">${product.name} - $${product.sellPrice.toFixed(2)}</option>
          `;
        }
      });
    };

    window.openGallery = (productId) => {
      const product = inventory.find(p => p.id === productId);
      if (!product) return;

      const galleryModal = document.createElement('div');
      galleryModal.className = 'modal gallery arms-modal';
      galleryModal.innerHTML = `
        <div class="modal-content">
          <span class="close">&times;</span>
          <h2>Galería de ${product.name}</h2>
          <img src="${product.imageUrl}" alt="${product.name}" 
               onerror="this.src='https://via.placeholder.com/150'" 
               style="max-width: 100%; height: auto;"/>
        </div>
      `;
      document.body.appendChild(galleryModal);
      galleryModal.style.display = 'block';

      const closeBtn = galleryModal.querySelector('.close');
      closeBtn.onclick = () => {
        galleryModal.remove();
      };
    };

    function addImageToProduct(productId) {
      const newImageUrl = prompt("Ingrese la URL de la nueva imagen:");
      const product = inventory.find(p => p.id === productId);
      if (product && newImageUrl) {
        product.images = product.images || [];
        product.images.push(newImageUrl);
      }
      updateInventoryGrid();
    }

    function addTransaction(type, productName, quantity, price) {
      const transactionsBody = document.getElementById('transactionsBody');
      const newRow = document.createElement('tr');
      const totalPrice = price * quantity;
      newRow.innerHTML = `
        <td>${new Date().toLocaleDateString()}</td>
        <td>${type.charAt(0).toUpperCase() + type.slice(1)}</td>
        <td>${productName}</td>
        <td>${quantity}</td>
        <td>$${price.toFixed(2)}</td>
        <td>$${totalPrice.toFixed(2)}</td>
      `;
      transactionsBody.appendChild(newRow);
      updateDashboardStats();
    }

    function updateDashboardStats() {
      const totalInvested = inventory.reduce((sum, product) =>
        sum + (product.buyPrice * product.quantity), 0);

      const totalOrderSales = Array.from(document.querySelectorAll('.order-card'))
        .reduce((sum, orderCard) => {
          const totalText = orderCard.querySelector('.order-details p:last-child').textContent;
          const total = parseFloat(totalText.replace(/[^0-9.-]+/g, ''));
          return sum + (isNaN(total) ? 0 : total);
        }, 0);

      const totalItems = inventory.reduce((sum, product) =>
        sum + product.quantity, 0);

      document.getElementById('totalInvested').textContent = `$${(totalInvested).toFixed(2)}`;
      document.getElementById('totalSales').textContent = `$${totalOrderSales.toFixed(2)}`;
      document.getElementById('totalProducts').textContent = totalItems;
    }

    function loadSavedData() {
      const savedOrders = localStorage.getItem('orders');
      const savedInventory = localStorage.getItem('inventory');
      
      // Clear existing displays first
      document.querySelectorAll('.orders-container').forEach(container => {
        container.innerHTML = '';
      });
      
      if (savedOrders) {
        orders = JSON.parse(savedOrders);
        orders.forEach(order => addOrderToDisplay(order));
      }
      
      if (savedInventory) {
        inventory = JSON.parse(savedInventory);
        updateInventoryGrid();
      }
      
      updateOrderCount();
      updateTotalProductsCount();
      updateTotalInvested();
    }

    function updateHTMLStructure() {
      const sections = ['in-progress', 'delivering', 'completed'];
      sections.forEach(section => {
        const sectionElement = document.getElementById(section);
        if (sectionElement && !sectionElement.querySelector('.orders-container')) {
          const container = document.createElement('div');
          container.className = 'orders-container';
          sectionElement.appendChild(container);
        }
      });
    }

    window.archiveOrder = (orderId) => {
      const orderIndex = orders.findIndex(o => o.id === orderId);
      if (orderIndex > -1) {
        // Remove from active orders and add to archived orders
        const order = orders.splice(orderIndex, 1)[0];
        order.archived = true;
        archivedOrders.push(order);
        saveData();
        updateCompletedOrders();
        document.querySelector('.floating-confirm')?.remove();
      }
    };

    window.unarchiveOrder = (orderId) => {
      const orderIndex = archivedOrders.findIndex(o => o.id === orderId);
      if (orderIndex > -1) {
        const order = archivedOrders.splice(orderIndex, 1)[0];
        delete order.archived;
        order.status = 'orders'; 
        orders.push(order);
        saveData();
        updateCompletedOrders();
        document.querySelector('.floating-confirm')?.remove();
      }
    };

    window.deleteOrder = (scriptId) => {
      // Find order in both active and archived arrays
      let orderIndex = orders.findIndex(o => o.id === scriptId);
      let targetArray = orders;
      
      if (orderIndex === -1) {
        orderIndex = archivedOrders.findIndex(o => o.id === scriptId);
        targetArray = archivedOrders;
      }

      if (orderIndex > -1) {
        // Only remove the specific order
        targetArray.splice(orderIndex, 1);
        saveData();
        // Update display based on current view
        if (showingArchived) {
          updateCompletedOrders();
        } else {
          const orderCard = document.querySelector(`.order-card[data-id="${scriptId}"]`);
          if (orderCard) {
            orderCard.remove();
          }
        }
        document.querySelector('.floating-confirm')?.remove();
      }
    };

    function updateCompletedOrders() {
      const completedContainer = document.querySelector('#completed .orders-container');
      if (!completedContainer) return;
      
      completedContainer.innerHTML = '';
      // Show either archived or active orders based on showingArchived flag
      const ordersToShow = showingArchived ? 
        archivedOrders : 
        orders.filter(o => o.status === 'completed' && !o.archived);
  
      ordersToShow.forEach(order => {
        const orderCard = createOrderCard(order);
        completedContainer.appendChild(orderCard);
      });
    }

    document.getElementById('showActiveBtn').addEventListener('click', (e) => {
      e.preventDefault(); 
      showingArchived = false;
      document.getElementById('showArchivedBtn').classList.remove('active-filter');
      e.target.classList.add('active-filter');
      updateCompletedOrders();
      // Prevent section change
      const completedTab = document.querySelector('.tab-btn[data-section="completed"]');
      if (!completedTab.classList.contains('active')) {
        completedTab.click();
      }
    });

    document.getElementById('showArchivedBtn').addEventListener('click', (e) => {
      e.preventDefault(); 
      showingArchived = true;
      document.getElementById('showActiveBtn').classList.remove('active-filter');
      e.target.classList.add('active-filter');
      updateCompletedOrders();
      // Prevent section change
      const completedTab = document.querySelector('.tab-btn[data-section="completed"]');
      if (!completedTab.classList.contains('active')) {
        completedTab.click();
      }
    });

    window.showArchiveConfirmation = (scriptId) => {
      const confirmDiv = document.createElement('div');
      confirmDiv.className = 'floating-confirm';
      confirmDiv.innerHTML = `
        <div class="floating-confirm-content">
          <h3>Confirmar Archivo</h3>
          <p>¿Deseas archivar este pedido?</p>
          <div class="confirm-buttons">
            <button onclick="archiveOrder(${scriptId})" class="confirm-btn">Sí, Archivar</button>
            <button onclick="this.closest('.floating-confirm').remove()" class="cancel-btn">Cancelar</button>
          </div>
        </div>
      `;
      document.body.appendChild(confirmDiv);
    };

    window.showDeleteConfirmation = (scriptId) => {
      const confirmDiv = document.createElement('div');
      confirmDiv.className = 'floating-confirm';
      confirmDiv.innerHTML = `
        <div class="floating-confirm-content">
          <h3>Confirmar Eliminación</h3>
          <p>¿Estás seguro de que deseas eliminar este pedido?</p>
          <div class="confirm-buttons">
            <button onclick="deleteOrder(${scriptId})" class="confirm-btn">Sí, Eliminar</button>
            <button onclick="this.closest('.floating-confirm').remove()" class="cancel-btn">Cancelar</button>
          </div>
        </div>
      `;
      document.body.appendChild(confirmDiv);
    };

    window.showUnarchiveConfirmation = (scriptId) => {
      const confirmDiv = document.createElement('div');
      confirmDiv.className = 'floating-confirm';
      confirmDiv.innerHTML = `
        <div class="floating-confirm-content">
          <h3>Confirmar Desarchivar</h3>
          <p>¿Deseas desarchivar este pedido?</p>
          <div class="confirm-buttons">
            <button onclick="unarchiveOrder(${scriptId})" class="confirm-btn">Sí, Desarchivar</button>
            <button onclick="this.closest('.floating-confirm').remove()" class="cancel-btn">Cancelar</button>
          </div>
        </div>
      `;
      document.body.appendChild(confirmDiv);
    };

    window.editOrder = (scriptId) => {
      const order = orders.find(o => o.id === scriptId) || archivedOrders.find(o => o.id === scriptId);
      if (!order) return;

      const editModal = document.getElementById('editOrderModal');
      const editForm = document.getElementById('editOrderForm');
      
      editForm.customerName.value = order.customer;
      editForm.customerPhone.value = order.phone;
      
      let currentEditItems = [...order.items];
      updateEditOrderSummary(currentEditItems);
      
      editForm.onsubmit = (e) => {
        e.preventDefault();
        order.customer = editForm.customerName.value;
        order.phone = editForm.customerPhone.value;
        order.items = currentEditItems;
        order.total = currentEditItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        saveData();
        updateOrderDisplay(order);
        editModal.style.display = 'none';
      };
      
      editModal.style.display = 'block';
    };

    function updateEditOrderSummary(items) {
      const orderItemsDiv = document.getElementById('editOrderItems');
      const orderTotalSpan = document.getElementById('editOrderTotal');
      
      orderItemsDiv.innerHTML = items.map((item, index) => `
        <div class="order-item">
          <span>${item.name} x ${item.quantity}</span>
          <span>$${(item.price * item.quantity).toFixed(2)}</span>
          <button type="button" class="remove-item" onclick="removeEditOrderItem(${index})">&times;</button>
        </div>
      `).join('');
      
      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      orderTotalSpan.textContent = total.toFixed(2);
    }

    window.removeEditOrderItem = (index) => {
      const items = Array.from(document.querySelectorAll('#editOrderItems .order-item'));
      if (items[index]) {
        items[index].remove();
        updateEditOrderSummary(items);
      }
    };

    function updateOrderDisplay(order) {
      const orderCard = document.querySelector(`.order-card[data-id="${order.id}"]`);
      if (orderCard) {
        orderCard.remove();
      }
      addOrderToDisplay(order);
    }

    const memberElements = document.querySelectorAll('.member-card');
    memberElements.forEach(member =>
      member.querySelector('.edit-btn').disabled = true);

    // Add members section logic
    function initializeMembersSection() {
      const addMemberBtn = document.getElementById('addMemberBtn');
      const memberModal = document.getElementById('memberModal');
      const memberForm = document.getElementById('memberForm');

      addMemberBtn.addEventListener('click', () => {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.role === 'admin') {
          memberModal.style.display = 'block';
        } else {
          alert('Solo los administradores pueden añadir miembros');
        }
      });

      memberForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(memberForm);
        const newMember = {
          id: Date.now(),
          name: formData.get('memberName'),
          email: formData.get('memberEmail'),
          password: formData.get('memberPassword'),
          role: formData.get('memberRole')
        };

        members.push(newMember);
        localStorage.setItem('members', JSON.stringify(members));
        updateMembersGrid();
        memberModal.style.display = 'none';
        memberForm.reset();
      });

      updateMembersGrid();
    }

    function updateMembersGrid() {
      const membersGrid = document.getElementById('membersGrid');
      membersGrid.innerHTML = '';

      members.forEach(member => {
        const memberCard = createMemberCard(member);
        membersGrid.appendChild(memberCard);
      });
    }

    function createMemberCard(member) {
      const div = document.createElement('div');
      div.className = 'member-card';
      div.innerHTML = `
        <div class="member-avatar">${member.name.charAt(0)}</div>
        <div class="member-info">
          <h3>${member.name}</h3>
          <p>${member.email}</p>
          <p>Rol: ${member.role}</p>
        </div>
        ${currentUser && currentUser.role === 'admin' ? `
          <div class="member-actions">
            <button onclick="editMember(${member.id})" class="edit-btn">Editar</button>
            <button onclick="deleteMember(${member.id})" class="delete-btn">Eliminar</button>
          </div>
        ` : ''}
      `;
      return div;
    }

    window.editMember = (scriptId) => {
      if (currentUser && currentUser.role === 'admin') {
        const member = members.find(m => m.id === scriptId);
        if (member) {
          // Implement edit functionality (similar to adding members but prefilled)
        }
      }
    };

    window.deleteMember = (scriptId) => {
      if (currentUser && currentUser.role === 'admin') {
        const confirmDiv = document.createElement('div');
        confirmDiv.className = 'floating-confirm';
        confirmDiv.innerHTML = `
          <div class="floating-confirm-content">
            <h3>Confirmar Eliminación</h3>
            <p>¿Estás seguro de que deseas eliminar este miembro?</p>
            <div class="confirm-buttons">
              <button onclick="confirmDeleteMember(${scriptId})" class="confirm-btn">Sí, Eliminar</button>
              <button onclick="this.closest('.floating-confirm').remove()" class="cancel-btn">Cancelar</button>
            </div>
          </div>
        `;
        document.body.appendChild(confirmDiv);
      }
    };
  
    window.confirmDeleteMember = (scriptId) => {
      const index = members.findIndex(m => m.id === scriptId);
      if (index > -1) {
        members.splice(index, 1);
        localStorage.setItem('members', JSON.stringify(members));
        updateMembersGrid();
      }
      document.querySelector('.floating-confirm')?.remove();
    };

    document.getElementById('showActiveBtn').classList.add('active-filter');
    updateCompletedOrders();
  
    updateHTMLStructure();
    loadSavedData();
  
    initializeMembersSection();
  
    // Add members tab button
    const orderTabs = document.querySelector('.order-tabs');
    const membersTab = document.createElement('button');
    membersTab.className = 'tab-btn';
    membersTab.dataset.section = 'members';
    membersTab.textContent = 'Miembros';
    orderTabs.appendChild(membersTab);
  }

  // Add logout functionality
  const logoutBtn = document.createElement('button');
  logoutBtn.textContent = 'Cerrar Sesión';
  logoutBtn.className = 'logout-btn';
  logoutBtn.style.cssText = `
    position: absolute;
    top: 1rem;
    right: 1rem;
    padding: 0.5rem 1rem;
    background: var(--red-color);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  `;
  logoutBtn.onclick = () => {
    localStorage.removeItem('currentUser');
    window.location.reload();
  };
  document.getElementById('appContainer').appendChild(logoutBtn);
});