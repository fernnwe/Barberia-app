console.log("login.js cargado correctamente");

// Inicializar Supabase
const SUPABASE_URL = "https://dcbwwcdsmbwlphrlsnyf.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjYnd3Y2RzbWJ3bHBocmxzbnlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2MDkyODksImV4cCI6MjA3OTE4NTI4OX0.KwKgpL1JsVpTlPqmGhtlHaH7uIg6nsP2dtilqEJrKUo";

// Crear cliente Supabase
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

    // Validar campos vacíos
    if (!usuario || !contraseña) {
        mensajeDiv.style.color = "#f87171";
        mensajeDiv.textContent = "Por favor ingresa usuario y contraseña";
        return;
    }

    try {
        // Consultar Supabase
        const { data, error } = await supabaseClient
            .from("usuarios")
            .select("*")
            .eq("usuario", usuario)
            .eq("contraseña", contraseña)
            .single(); // devuelve un solo objeto

        if (error) throw error;

        if (!data) {
            mensajeDiv.style.color = "#f87171";
            mensajeDiv.textContent = "Usuario o contraseña incorrectos";
            return;
        }

        // Login exitoso
        mensajeDiv.style.color = "#4ade80";
        mensajeDiv.textContent = `¡Bienvenido, ${data.nombre}!`;

        // Redirigir al dashboard
        setTimeout(() => {
            window.location.href = "index.html";
        }, 1000);

    } catch (err) {
        console.error(err);
        mensajeDiv.style.color = "#f87171";
        mensajeDiv.textContent = "Ocurrió un error al intentar ingresar";
    }
});
