console.log("login.js cargado correctamente");

// 🔒 Si ya hay sesión activa, no mostrar login
const usuarioActivo = localStorage.getItem("usuarioLogueado");
if (usuarioActivo) {
    window.location.href = "index.html";
}

// Inicializar Supabase
const SUPABASE_URL = "https://zfxxvgbnhqenewdfgaqv.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmeHh2Z2JuaHFlbmV3ZGZnYXF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MDgzMjgsImV4cCI6MjA4Nzk4NDMyOH0.t6LhYjK6ZBQdZiwo8Pzgo1zlwNH3ldHe_gJQh4Mb5I4"; // usa la tuya real

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Elementos del DOM
const usuarioInput = document.getElementById("usuario");
const contraseñaInput = document.getElementById("contraseña");
const btnLogin = document.getElementById("btnLogin");
const mensajeDiv = document.getElementById("mensaje");

// Función de login
btnLogin.addEventListener("click", async () => {
    const usuario = usuarioInput.value.trim();
    const contraseña = contraseñaInput.value.trim();

    if (!usuario || !contraseña) {
        mensajeDiv.style.color = "#f87171";
        mensajeDiv.textContent = "Por favor ingresa usuario y contraseña";
        return;
    }

    try {
        const { data, error } = await supabaseClient
            .from("usuarios")
            .select("*")
            .eq("usuario", usuario)
            .eq("contraseña", contraseña)
            .single();

        if (error) throw error;

        if (!data) {
            mensajeDiv.style.color = "#f87171";
            mensajeDiv.textContent = "Usuario o contraseña incorrectos";
            return;
        }

        // ✅ LOGIN EXITOSO
        mensajeDiv.style.color = "#4ade80";
        mensajeDiv.textContent = `¡Bienvenido, ${data.nombre}!`;

        // 🔒 GUARDAR SESIÓN
        localStorage.setItem("usuarioLogueado", data.usuario);
        localStorage.setItem("nombreUsuario", data.nombre);

        setTimeout(() => {
            window.location.href = "index.html";
        }, 1000);

    } catch (err) {
        console.error(err);
        mensajeDiv.style.color = "#f87171";
        mensajeDiv.textContent = "Ocurrió un error al intentar ingresar";
    }
});