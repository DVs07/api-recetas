function iniciarApp() {

    const selectCategorias = document.querySelector('#categorias');
    const contenedorRecetas = document.querySelector('#resultado');
    const modal = new bootstrap.Modal('#modal',{});

    if(selectCategorias){
        selectCategorias.addEventListener('change', seleccionarCategoria);
        obtenerCategorias();
    }
    
    const favoritosDiv = document.querySelector('.favoritos');
    if(favoritosDiv){      
        obtenerFavoritos();
    }

    async function obtenerCategorias(){
        const url = 'https://www.themealdb.com/api/json/v1/1/list.php?c=list';

        try {
            const respuesta = await fetch(url);
            const resultado = await respuesta.json();
            mostrarCategorias(resultado.meals);
        } catch (error) {
            console.log(error); 
        }
    }

    function mostrarCategorias(categorias = []) {
        // console.log(categorias);

        // Muestro las categorias
        categorias.forEach(categoria => {
            // console.log(categoria.strCategory);
            const { strCategory } = categoria;
            const option = document.createElement('option');
            // console.log(option.outerHTML);
            option.value = strCategory;
            option.textContent = strCategory;
            // console.log(option);
            selectCategorias.appendChild(option);
            
        });
        
    }

    function seleccionarCategoria(e){
        // console.log(e.target.value);
        const categoria = e.target.value;

        const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`;

        // console.log(url);

        fetch(url)
            .then( respuesta => respuesta.json())
            .then( resultado => mostrarRecetas(resultado.meals));
        
    }

    function mostrarRecetas(recetas = []){
        // console.log(recetas);

        limpiarHTML(resultado);

        // Crear Titulo
        const titulo = document.createElement('h2');
        titulo.classList.add('text-center', 'text-black', 'my-5');
        titulo.textContent = recetas.length ? 'Recetas' : 'No hay recetas que coincidan con tu busqueda';
        resultado.appendChild(titulo);
        // Iterar en los resultados
        recetas.forEach(receta => {
            const {idMeal, strMeal, strMealThumb} = receta;

            // Crear el contenedor
            const divReceta = document.createElement('div');
            divReceta.classList.add('col-md-4');
            // console.log(divReceta);

            // Crear la card
            const cardReceta = document.createElement('div');
            cardReceta.classList.add('card', 'mb-4');

            // console.log(cardReceta);

            // Crear la imagen
            const imgReceta = document.createElement('img');
            imgReceta.classList.add('card-img-top');
            imgReceta.alt = `Imagen de la receta ${strMeal}`;
            imgReceta.src = strMealThumb ?? receta.imagen;
            
            // console.log(imgReceta);

            // Crear el cuerpo de la card
            const cardBody = document.createElement('div');
            cardBody.classList.add('card-body');
            
            // Crear el titulo
            const heading = document.createElement('h3');
            heading.classList.add('card-title');
            heading.textContent = strMeal ?? receta.titulo;
            // console.log(heading.outerHTML); // Muestra el html de la card
            // console.log(heading.outerText); // Muestra el texto de la card
            
            // Crear el boton
            const boton = document.createElement('button');
            boton.classList.add('btn', 'btn-danger', 'w-100');
            boton.textContent = 'Ver Receta';
            // boton.dataset.bsTarget = '#modal';
            // boton.dataset.bsToggle = 'modal';
            boton.onclick = function (){
                verReceta(idMeal ?? receta.id);
            };

            // Renderizar la card
            cardBody.appendChild(heading);
            cardBody.appendChild(boton);

            cardReceta.appendChild(imgReceta);
            cardReceta.appendChild(cardBody);
            
            divReceta.appendChild(cardReceta);
            
            // Insertar en el HTML
            contenedorRecetas.appendChild(divReceta);

            
        });
    }

    function verReceta(idReceta){
        // console.log(idReceta);
        const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${idReceta}`;

        fetch(url)
            .then(respuesta => respuesta.json())
            .then(resultado => mostrarModal(resultado.meals[0]));
        
    }

    function mostrarModal(receta){
        const {idMeal, strMeal, strInstructions, strMealThumb} = receta;
        // console.log(receta);
        
        // Asignar los valores
        const modalTitle = document.querySelector('.modal .modal-title');
        const modalBody = document.querySelector('.modal .modal-body');

        modalTitle.textContent = strMeal;       
        modalBody.innerHTML = `
            <img class="img-fluid" src="${strMealThumb}" alt="Imagen de la receta ${strMeal}">
            <h3 class="my-2"> Instrucciones </h3>
            <p>${strInstructions}</p>
            <h3 class="my-2"> Ingredientes y Cantidades </h3>
        `;
        
        const listaIngredientes = document.createElement('ul');
        listaIngredientes.classList.add('list-group');

        // Mostrar ingredientes y cantidades
        for(let i=1; i<=20 ; i++){
            if(receta[`strIngredient${i}`]){
                const ingrediente = receta[`strIngredient${i}`];
                const cantidad = receta[`strMeasure${i}`];


                const li = document.createElement('li');
                li.classList.add('list-group-item');
                li.textContent = `${ingrediente} - ${cantidad}`;

                listaIngredientes.appendChild(li);
            }
        }

        modalBody.appendChild(listaIngredientes);
        const modalFooter = document.querySelector('.modal-footer');

        // Botonones cerrar y favorito
        const btnFavorito = document.createElement('button');
        btnFavorito.classList.add('btn', 'btn-danger','col');
        btnFavorito.textContent = existeStorage(idMeal) ? 'Eliminar Favorito' : 'Guardar Favorito';

        // LocalStorage
        btnFavorito.onclick = function(){
            // console.log(existeStorage(idMeal));

            if(existeStorage(idMeal)){
                eliminarFavorito(idMeal);
                btnFavorito.textContent = 'Guardar Favorito';
                mostrarToast('Eliminado Correctamente');
                return;
            }
            
            agregarFavorito({id: idMeal, titulo: strMeal, imagen: strMealThumb});
            btnFavorito.textContent = 'Eliminar Favorito';
            mostrarToast('Agregado a Favoritos');
        }

        const btnCerrar = document.createElement('button');
        btnCerrar.classList.add('btn', 'btn-secondary','col');
        btnCerrar.textContent = 'Cerrar';
        btnCerrar.onclick = function (){
            modal.hide();
        };

        limpiarHTML(modalFooter);
        modalFooter.appendChild(btnFavorito);
        modalFooter.appendChild(btnCerrar);
        
        // Muestro el Modal
        modal.show();
    }

    function agregarFavorito(receta){
        // console.log('Agregando a favoritos');
        // console.log(receta);
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        localStorage.setItem('favoritos', JSON.stringify([...favoritos, receta] ));        

        if(favoritosDiv){      
            obtenerFavoritos();
        }
    }

    function existeStorage(idReceta){
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        return favoritos.some(favorito => favorito.id === idReceta);
    }

    function eliminarFavorito(idReceta){
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        const nuevosFavoritos = favoritos.filter(favorito => favorito.id !== idReceta);
        localStorage.setItem('favoritos', JSON.stringify(nuevosFavoritos));

        if(favoritosDiv){      
            obtenerFavoritos();
        }
    }

    function mostrarToast(mensaje){
        const toastDiv = document.querySelector('#toast');
        const toastBody = document.querySelector('.toast-body');
        const toast = new bootstrap.Toast(toastDiv);
        toastBody.textContent = mensaje;
        toast.show();
    }

    function obtenerFavoritos(){
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        // console.log(favoritos);
        let anterior = favoritos.length;
        if(favoritos.length>0){
            mostrarRecetas(favoritos);
            return;
        }

        const sinFavoritos = document.createElement('p');
        sinFavoritos.textContent = 'No hay favoritos';
        sinFavoritos.classList.add('fs-4', 'fw-bold', 'mt-5');
        contenedorRecetas.appendChild(sinFavoritos);
        
    }

    function limpiarHTML(selector){
        while(selector.firstChild){
            selector.removeChild(selector.firstChild);
    
        }
    }
}


document.addEventListener('DOMContentLoaded', iniciarApp);