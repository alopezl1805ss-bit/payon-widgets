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

// shopperResultUrl (OBLIGATORIO PARA REDIRIGIR)
const SHOPPER_URL = "https://www.filippacasaflora.com/resultado-pago";

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
    onReady: function () {
        console.log("WPWL listo en Filippa.");
    }
};

// ================================
// INYECTA AUTOMÁTICAMENTE EL FORM WPWL
// ================================

function loadPayOnWidget(checkoutId) {
    const container = document.getElementById("paymentWidget");
    if (!container) {
        console.error("No existe el contenedor #paymentWidget en la página.");
        return;
    }

    container.innerHTML = `
        <form action="${SHOPPER_URL}" class="paymentWidgets" data-brands="VISA MASTER"></form>
    `;

    const script = document.createElement("script");
    script.src = `${BASE_URL}/v1/paymentWidgets.js?checkoutId=${checkoutId}`;
    document.body.appendChild(script);
}

// ================================
// GENERAR CHECKOUT
// ================================

async function generarCheckout() {

    const body =
        `entityId=${ENTITY_ID}` +
        `&amount=${amount}` +
        `&currency=MXN` +
        `&paymentType=DB` +
        `&testMode=${TEST_MODE}` +
        `&merchantTransactionId=${merchantTransactionId}` +
        `&descriptor=${DESCRIPTOR}` +
        `&customer.email=${email}` +
        `&customer.givenName=${customerName}` +
        `&customer.surname=${customerLastname}` +
        `&customer.mobile=${phone}` +
        `&shopperResultUrl=${encodeURIComponent(SHOPPER_URL)}`;

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

        loadPayOnWidget(data.id);

    } catch (err) {
        console.error("Error generarCheckout:", err);
    }
}

// Ejecutar automáticamente
generarCheckout();
