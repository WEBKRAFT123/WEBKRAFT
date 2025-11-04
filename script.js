document.addEventListener('DOMContentLoaded', () => {

    // --- Variables Globales y Selectores ---
    const cart = []; 
    const cartItemsList = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    
    // Selectores para TODOS los botones de añadir al carrito
    const addToCartButtons = document.querySelectorAll('.add-to-cart'); // Cuadrícula (Top 4)
    const addToCartAccordionButtons = document.querySelectorAll('.add-to-cart-accordion'); // Acordeón

    // Botones y Contadores
    const cartNavBtn = document.getElementById('cart-nav-btn');
    const fixedCartBtn = document.getElementById('open-fixed-modal');
    const cartItemCount = document.getElementById('cart-item-count');

    // Modal de Checkout
    const modal = document.getElementById('checkout-modal');
    const closeBtn = document.querySelector('.close-btn');
    const paymentForm = document.getElementById('payment-form');
    
    // Selectores para el Menú Desplegable (Acordeón)
    const categoryTitles = document.querySelectorAll('.category-title'); // Títulos de Categoría (Nivel 1)
    const menuHeaders = document.querySelectorAll('.menu-item-header'); // Títulos de Platos (Nivel 2)

    // --- Funciones de Utilidad ---

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(amount);
    };

    // --- Lógica del Acordeón (Nivel 1: Categorías) ---
    
    categoryTitles.forEach(title => {
        title.addEventListener('click', () => {
            const targetId = title.dataset.categoryTarget;
            const categoryListDiv = document.getElementById(targetId);

            // Alternar la visibilidad de la lista de platos
            if (categoryListDiv.style.maxHeight) {
                categoryListDiv.style.maxHeight = null;
                title.classList.remove('open');
            } else {
                // Abrir el elemento actual
                categoryListDiv.style.maxHeight = categoryListDiv.scrollHeight + "px"; 
                title.classList.add('open');

                // Opcional: Cerrar otras categorías abiertas (para mejor UX)
                document.querySelectorAll('.menu-category-list').forEach(list => {
                    if (list.id !== targetId) {
                        list.style.maxHeight = null;
                    }
                });
                document.querySelectorAll('.category-title').forEach(t => {
                    if (t !== title) {
                        t.classList.remove('open');
                    }
                });
            }
        });
    });

    // --- Lógica del Acordeón (Nivel 2: Descripciones de Platos) ---
    
    menuHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const targetId = header.dataset.target;
            const descriptionDiv = document.getElementById(targetId);
            const toggleBtn = header.querySelector('.toggle-btn');

            if (descriptionDiv.style.maxHeight) {
                descriptionDiv.style.maxHeight = null;
                toggleBtn.textContent = '+';
                header.classList.remove('active');
            } else {
                // Si abres una descripción, recalcula la altura de su CATEGORÍA padre
                const parentList = header.closest('.menu-category-list');
                const initialParentHeight = parentList.scrollHeight;
                
                // Abrir el elemento actual
                descriptionDiv.style.maxHeight = descriptionDiv.scrollHeight + "px"; 
                toggleBtn.textContent = '–';
                header.classList.add('active');

                // Ajustar altura de la categoría padre para acomodar la descripción
                if (parentList) {
                     // Suma la altura inicial de la lista + la altura de la descripción que se abre
                    parentList.style.maxHeight = initialParentHeight + descriptionDiv.scrollHeight + "px";
                }
            }
        });
    });


    // --- Lógica del Carrito (Unificada) ---

    // Función principal para actualizar el carrito en la UI
    const updateCartDisplay = () => {
        cartItemsList.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartItemsList.innerHTML = '<li style="color: #999; text-align: center; padding: 10px 0;">El carrito está vacío.</li>';
        }

        cart.forEach((item, index) => {
            const li = document.createElement('li');
            li.style.display = 'flex';
            li.style.justifyContent = 'space-between';
            li.style.padding = '8px 0';
            li.style.borderBottom = '1px dashed #eee';
            li.innerHTML = `
                <span style="max-width: 70%;">${item.name}</span>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <strong>${formatCurrency(item.price)}</strong>
                    <button class="remove-from-cart-btn" data-index="${index}" style="background: #D81B60; color: white; border-radius: 5px; padding: 2px 6px; font-size: 0.9rem; cursor: pointer;">X</button>
                </div>
            `;
            cartItemsList.appendChild(li);
            total += item.price;
        });

        // Re-adjuntar eventos de eliminación después de (re)crear los elementos
        document.querySelectorAll('.remove-from-cart-btn').forEach(button => {
            button.addEventListener('click', removeFromCart);
        });

        cartTotalElement.textContent = formatCurrency(total);
        cartNavBtn.textContent = `Carrito (${cart.length})`;
        cartItemCount.textContent = cart.length; 
    };

    // Función para eliminar un artículo
    const removeFromCart = (event) => {
        const index = parseInt(event.target.dataset.index, 10);
        cart.splice(index, 1); // Elimina 1 elemento en la posición 'index'
        updateCartDisplay();
    };


    // Función genérica para añadir producto y actualizar la vista
    const addItemToCart = (button) => {
        const name = button.dataset.name;
        const price = parseInt(button.dataset.price, 10); 
        
        cart.push({ name, price });
        updateCartDisplay();
        
        // Efecto de pulso en el botón flotante al añadir un ítem
        fixedCartBtn.classList.add('pulse'); 
        setTimeout(() => fixedCartBtn.classList.remove('pulse'), 500);
    };

    // Conectar botones de cuadrícula
    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => addItemToCart(button));
    });
    
    // Conectar botones del acordeón
    addToCartAccordionButtons.forEach(button => {
        button.addEventListener('click', () => addItemToCart(button));
    });


    // Inicializar el display del carrito al cargar la página
    updateCartDisplay(); 

    // --- Lógica del Modal y Pago (FIX - Usando CSS display:none) ---
    
    // Abrir modal con botón flotante
    fixedCartBtn.addEventListener('click', () => {
        modal.style.display = 'block';
    });
    
    // Abrir modal con botón de navegación
    cartNavBtn.addEventListener('click', (e) => {
        e.preventDefault();
        modal.style.display = 'block';
    });

    // Cerrar modal con X
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });

    paymentForm.addEventListener('submit', (event) => {
        event.preventDefault(); 
        
        if (cart.length === 0) {
            alert('No puedes pagar, tu carrito está vacío.');
            return;
        }

        const address = document.getElementById('address').value;
        const totalPagar = cartTotalElement.textContent;

        alert(`¡🎉 Pedido APROBADO (Simulado)! 🎉
        
        Tu pago de ${totalPagar} ha sido procesado.
        El pedido será enviado a: ${address}
        
        ¡Gracias por comprar en La Patrona!`);
        
        modal.style.display = 'none';
        paymentForm.reset();
        cart.length = 0; 
        updateCartDisplay(); 
    });

});