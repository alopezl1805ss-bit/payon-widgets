// ================================
// PayOn Dynamic Widget for Wix
// By: Alejandro (Filippa Casa Flora)
// ================================

// Obtiene el <script> que carga este archivo y sus atributos:
const scriptEl = document.currentScript;

// Lee los atributos enviados desde Wix
const amount = scriptEl.getAttribute("amount") || "100";
const description = scriptEl.getAttribute("description") || "Pago Filippa";
const email = scriptEl.getAttribute("email") || "test@mail.com";
const phone = scriptEl.getAttribute("phone") || "+525512345678";
const customerName = scriptEl.getAttribute("name") || "Cliente Test";
const customerLastname = scriptEl.getAttribute("lastname") || "Prueba";

// CONFIGURACIÓN EXIGIDA POR EL BANCO
const DESCRIPTOR = "9791965";
const ENTITY_ID = "8ac7a4c899a8dc3b0199aa8304cf03f0";
const BASE_URL = "https://eu-test.oppwa.com";  // Ambiente UAT
const ACCESS_TOKEN = "OGFjN2E0Yzg5OWE4ZGMzYjAxOTlhYTgyNTNhNjAzZWN8IURwK0U1Y1FLbWltdD9xVWlVWHk=";

// Parámetros obligatorios para pruebas
const TEST_MODE = "EXTERNAL";

// Genera un merchantTransactionId ÚNICO por transacción
const merchantTransactionId = `FILIPPA_${Date.now()}`;

// ================================
// CONFIGURACIÓN DEL WIDGET (WPWL)
// ================================

window.wpwlOptions = {
    locale: "es",

    paymentBrands: ["VISA", "MASTER"],

    customer: {
        givenName: customerName,
        surname: customerLastname,
        email: email,
        phone: phone
    },

    billingAddress: {
        street1: "Prueba 123",
        city: "CDMX",
        state: "CDMX",
        country: "MX",
        postcode: "01000"
    },

    onReady: function() {
        console.log("WPWL listo en Filippa.");
    }
};

// ================================
// INJECTA AUTOMÁTICAMENTE EL FORM WPWL
// ================================

function loadPayOnWidget(checkoutId) {
    const container = document.getElementById("formPagoPayOn");
    if (!container) {
        console.error("No existe el contenedor #formPagoPayOn en la página.");
        return;
    }

    container.innerHTML = `
        <form action="/resultado-pago" class="paymentWidgets" data-brands="VISA MASTER"></form>
    `;

    const script = document.createElement("script");
    script.src = `${BASE_URL}/v1/paymentWidgets.js?checkoutId=${checkoutId}`;
    document.body.appendChild(script);
}

// ================================
// FUNCIONES PARA WIX (LLAMADAS DESDE wix-code)
// ================================

// Generar checkout desde PayOn
async function generarCheckout() {

    const body =
        `entityId=${ENTITY_ID}` +
        `&amount=${amount}` +
        `&currency=MXN` +
        `&paymentType=DB` +
        `&testMode=${TEST_MODE}` +        // <== requerido por el banco
        `&merchantTransactionId=${merchantTransactionId}` +
        `&descriptor=${DESCRIPTOR}` +     // <== número de afiliación
        `&customer.email=${email}` +
        `&customer.givenName=${customerName}` +
        `&customer.surname=${customerLastname}` +
        `&customer.mobile=${phone}`;

    try {
        const res = await fetch(`${BASE_URL}/v1/checkouts`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${ACCESS_TOKEN}`,
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body
        });

        const data = await res.json();
        console.log("Checkout generado:", data);

        if (!data.id) {
            console.error("Error generando checkout:", data);
            return;
        }

        // Carga el widget
        loadPayOnWidget(data.id);

    } catch (err) {
        console.error("Error generarCheckout:", err);
    }
}

// Llama automáticamente al generador
generarCheckout();
