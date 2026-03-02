const cortes = [

/* CLASICOS */
{nombre:"Corte Clásico",precio:120,cat:"clasicos"},
{nombre:"Corte Militar",precio:110,cat:"clasicos"},
{nombre:"Peinado Ejecutivo",precio:140,cat:"clasicos"},
{nombre:"Corte Escolar",precio:100,cat:"clasicos"},
{nombre:"Corte Tijera",precio:130,cat:"clasicos"},
{nombre:"Corte Vintage",precio:150,cat:"clasicos"},

/* FADE */
{nombre:"Low Fade",precio:150,cat:"fade"},
{nombre:"Mid Fade",precio:150,cat:"fade"},
{nombre:"High Fade",precio:160,cat:"fade"},
{nombre:"Skin Fade",precio:170,cat:"fade"},
{nombre:"Burst Fade",precio:180,cat:"fade"},
{nombre:"Taper Fade",precio:160,cat:"fade"},

/* MODERNOS */
{nombre:"Undercut",precio:180,cat:"modernos"},
{nombre:"Pompadour",precio:200,cat:"modernos"},
{nombre:"Crop Texturizado",precio:190,cat:"modernos"},
{nombre:"Mullet Moderno",precio:200,cat:"modernos"},
{nombre:"Mohicano",precio:180,cat:"modernos"},
{nombre:"Diseño con Navaja",precio:220,cat:"modernos"},

/* BARBA */
{nombre:"Perfilado de Barba",precio:100,cat:"barba"},
{nombre:"Barba Completa",precio:120,cat:"barba"},
{nombre:"Barba Fade",precio:140,cat:"barba"},
{nombre:"Ritual Barba Premium",precio:200,cat:"barba"},

/* EXTRA */
{nombre:"Corte + Barba",precio:250,cat:"modernos"},
{nombre:"Corte VIP",precio:300,cat:"modernos"},
{nombre:"Corte Niño",precio:90,cat:"clasicos"},
{nombre:"Corte Deportivo",precio:140,cat:"clasicos"},
{nombre:"Fade + Diseño",precio:230,cat:"fade"},
{nombre:"Fade Premium",precio:260,cat:"fade"},
{nombre:"Corte Artístico",precio:280,cat:"modernos"}

];

const grid = document.getElementById("catalogo");
const filtros = document.querySelectorAll(".filter");

function render(cat="todos"){
    grid.innerHTML="";

    cortes
    .filter(c=>cat==="todos"||c.cat===cat)
    .forEach(c=>{
        grid.innerHTML += `
        <div class="card">
            <img src="https://media.istockphoto.com/id/1321048753/es/vector/los-hombres-se-dirigen-entre-la-luz-del-poste-de-la-barber%C3%ADa.jpg?s=612x612&w=0&k=20&c=NVyDVgtRlSB8TSVlamAeQ62AzYK9Pqg99dR3QTBbRbI=" />
            <div class="info">
                <h3>${c.nombre}</h3>
                <div class="price">C$ ${c.precio}</div>
            </div>
        </div>`;
    });
}

render();

filtros.forEach(btn=>{
    btn.onclick=()=>{
        filtros.forEach(b=>b.classList.remove("active"));
        btn.classList.add("active");
        render(btn.dataset.cat);
    };
});

function irInicio() {
    window.location.href = "../../index.html";
}