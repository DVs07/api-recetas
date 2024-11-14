function iniciarApp() {

    const selectCategorias = document.querySelector('#categorias');

    obtenerCategorias();

    function obtenerCategorias(){
        const url = 'https://www.themealdb.com/api/json/v1/1/list.php?c=list';

        fetch(url)
            .then(respuesta => respuesta.json())
            .then(resultado => mostrarCategorias(resultado.meals));
    }

    function mostrarCategorias(categorias = []) {
        // console.log(categorias);

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
}


document.addEventListener('DOMContentLoaded', iniciarApp);