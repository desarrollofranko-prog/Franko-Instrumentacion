// ── Servicio de cotización de productos ──────────────────────────────────────
// Responsabilidad única: abrir el popup de SweetAlert2 con un formulario de contacto
// para que el usuario solicite cotización de un producto específico.
// Flujo completo:
//   1. El usuario hace clic en "Cotizar" desde cualquier tarjeta de producto
//   2. abrirAlertaCorreo() muestra el popup con los datos del producto y un formulario
//   3. El usuario llena nombre, email, confirmación de email, empresa y teléfono
//   4. preConfirm() valida los campos antes de procesar (sin cerrar el popup si hay errores)
//   5. Si es válido, se muestra un popup de carga y se envía el email via EmailJS
//   6. Se muestra un popup de éxito o error según el resultado del envío

// Injectable: decorador que marca esta clase como un servicio inyectable por Angular DI
import { Injectable } from '@angular/core';

// Swal: librería SweetAlert2 para mostrar popups modales customizados (no usa alertas nativas del browser)
import Swal from 'sweetalert2';

// emailjs: librería que envía emails directamente desde el navegador usando la API de EmailJS
import emailjs from '@emailjs/browser';

// ── Interfaz pública ──────────────────────────────────────────────────────────

// Define la forma del objeto que los componentes deben pasar a abrirAlertaCorreo()
// para mostrar los datos correctos del producto en el popup
export interface ItemCotizable {
  nombre: string;           // Nombre del producto (ej. "Válvula de Alivio Presión Vacío")
  serie: string;            // Serie del producto (ej. "Serie 1000")
  descripcion: string;      // Descripción corta del producto (se muestra en el popup)
  categoriaNombre?: string; // Nombre de la categoría (opcional — se muestra si está disponible)
}

// ── Credenciales de EmailJS (constantes de módulo para no repetirlas) ─────────
// Estas constantes identifican la cuenta de EmailJS y la plantilla de email a usar
const EMAILJS_SERVICE_ID  = 'service_6dpcpyq';   // ID del servicio de correo configurado en EmailJS dashboard
const EMAILJS_TEMPLATE_ID = 'template_e9fnael';   // ID de la plantilla con variables {{nombre}}, {{email}}, etc.
const EMAILJS_PUBLIC_KEY  = 'Q6H7SXxngUpg-8PjC'; // API key pública de la cuenta EmailJS

// Email de destino que aparece en el aviso de privacidad del popup
const VENTAS_EMAIL = 'ventas@franko.com.mx';

// @Injectable({ providedIn: 'root' }): registra el servicio como singleton en toda la aplicación
// Solo existe una instancia compartida entre todos los componentes que lo inyecten
@Injectable({ providedIn: 'root' })
export class CotizacionService {

  // Abre el popup de solicitud de cotización para el producto indicado
  // Parámetro item: datos del producto que se mostrarán en el encabezado del popup
  abrirAlertaCorreo(item: ItemCotizable): void {
    // Obtiene los colores del badge de serie según el número de la serie del producto
    const serieColor = this.getSerieColor(item.serie);

    // Swal.fire(): muestra el popup modal de SweetAlert2 con configuración personalizada
    Swal.fire({
      title: '',

      // html: contenido HTML dinámico del popup — muestra los datos del producto y el formulario
      // Template literals de JS permiten insertar variables directamente en el HTML del popup
      html: `
        <div class="fswal-header-img">
          <img src="assets/Membrete/Membrete-Formulario.png" alt="Franko Instrumentación" />
        </div>
        <h2 class="fswal-title-inline">Solicitar Cotización</h2>
        <div class="fswal-body">

          <div class="fswal-product-row">
            <span class="fswal-nombre">${item.nombre}</span>
            <span class="fswal-serie"
              style="background:${serieColor.bg};color:${serieColor.text}">
              ${item.serie}
            </span>
          </div>
          ${item.categoriaNombre
            ? `<p class="fswal-categoria">
                 <i class="bi bi-grid-fill"></i> ${item.categoriaNombre}
               </p>`
            : ''}
          <p class="fswal-desc">${item.descripcion}</p>

          <div class="fswal-form">
            <p class="fswal-form-title">Tus datos de contacto</p>

            <div class="fswal-field">
              <label for="swal-nombre">Nombre completo <span class="req">*</span></label>
              <input id="swal-nombre" type="text"
                class="fswal-input" placeholder="Ej. Juan García" autocomplete="name">
            </div>

            <div class="fswal-field">
              <label for="swal-email">Correo electrónico <span class="req">*</span></label>
              <input id="swal-email" type="email"
                class="fswal-input" placeholder="Ej. juan@empresa.com" autocomplete="email">
            </div>

            <div class="fswal-row2">
              <div class="fswal-field">
                <label for="swal-empresa">Empresa</label>
                <input id="swal-empresa" type="text"
                  class="fswal-input" placeholder="Nombre de tu empresa" autocomplete="organization">
              </div>
              <div class="fswal-field">
                <label for="swal-telefono">Teléfono</label>
                <input id="swal-telefono" type="tel"
                  class="fswal-input" placeholder="Ej. 5512345678" autocomplete="tel"
                  maxlength="10"
                  oninput="this.value=this.value.replace(/\\D/g,'').slice(0,10)">
              </div>
            </div>
          </div>

          <p class="fswal-aviso">
            <i class="bi bi-lock-fill"></i>
            Tu información se enviará únicamente a <a href="mailto:${VENTAS_EMAIL}">${VENTAS_EMAIL}</a>
          </p>
        </div>
      `,

      showCancelButton: true,                                              // Muestra el botón de cancelar
      confirmButtonText: '<i class="bi bi-send-fill me-1"></i> Enviar solicitud', // Texto e icono del botón de confirmar
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#4b5563',  // Gris para el botón de confirmar
      cancelButtonColor: '#e5e7eb',   // Gris claro para el botón de cancelar
      reverseButtons: true,           // Cancela a la izquierda, confirma a la derecha (orden más natural en formularios)
      focusConfirm: false,            // No enfoca automáticamente el botón de confirmar (mejora UX en formularios)

      // didOpen: se ejecuta cuando el popup ya está visible en el DOM
      // Se usa para adjuntar listeners que limpian los errores al escribir en los campos
      didOpen: () => {
        ['swal-nombre', 'swal-email', 'swal-telefono'].forEach(id => {
          document.getElementById(id)?.addEventListener('input', (e) => {
            // Al escribir en un campo con error, quita la clase de error y limpia el mensaje de validación
            (e.target as HTMLInputElement).classList.remove('fswal-input--error');
            Swal.resetValidationMessage();
          });
        });
      },

      // Clases CSS personalizadas para aplicar los estilos de marca de Franko al popup de SweetAlert2
      customClass: {
        popup:         'fswal-popup',
        title:         'fswal-title',
        htmlContainer: 'fswal-html-container',
        confirmButton: 'fswal-btn-confirm',
        cancelButton:  'fswal-btn-cancel',
      },

      // preConfirm: se ejecuta antes de cerrar el popup cuando el usuario hace clic en "Enviar"
      // Valida los campos del formulario y retorna false para mantener el popup abierto si hay errores,
      // o retorna el objeto de datos válidos si todo está bien
      preConfirm: () => {
        // Obtiene referencias a los elementos del formulario del DOM del popup
        const nombreEl   = document.getElementById('swal-nombre')   as HTMLInputElement;
        const emailEl    = document.getElementById('swal-email')    as HTMLInputElement;
        const telefonoEl = document.getElementById('swal-telefono') as HTMLInputElement;
        const empresaEl  = document.getElementById('swal-empresa')  as HTMLInputElement;

        // Lee y limpia los valores de los campos
        const nombre   = nombreEl.value.trim();
        const email    = emailEl.value.trim();
        const empresa  = empresaEl.value.trim();
        const telefono = telefonoEl.value.trim();

        const allInputs = [nombreEl, emailEl, empresaEl, telefonoEl];

        // Función interna: marca el campo con error visual y muestra el mensaje de validación en el popup
        const markError = (el: HTMLInputElement, msg: string) => {
          allInputs.forEach(e => e.classList.remove('fswal-input--error')); // Limpia errores previos
          el.classList.add('fswal-input--error'); // Marca el campo inválido con borde rojo
          el.focus();                             // Enfoca el campo inválido para que el usuario vea el problema
          Swal.showValidationMessage(msg);        // Muestra el mensaje de error bajo los botones del popup
        };

        // Valida nombre: requerido y con formato correcto (solo letras, espacios, guiones y apóstrofes)
        if (!nombre) {
          markError(nombreEl, 'El nombre es requerido');
          return false;
        }
        const nombreErr = this.validarNombre(nombre);
        if (nombreErr) {
          markError(nombreEl, nombreErr);
          return false;
        }

        // Valida email: requerido y con formato válido
        if (!email) {
          markError(emailEl, 'El correo electrónico es requerido');
          return false;
        }
        if (!this.validarEmail(email)) {
          markError(emailEl, 'Ingresa un correo válido (ej. usuario@dominio.com)');
          return false;
        }

        // Valida empresa solo si el usuario escribió algo (es un campo opcional)
        if (empresa) {
          const empresaErr = this.validarEmpresa(empresa);
          if (empresaErr) {
            markError(empresaEl, empresaErr);
            return false;
          }
        }

        // Valida teléfono solo si el usuario escribió algo (es un campo opcional)
        if (telefono && !this.validarTelefono(telefono)) {
          markError(telefonoEl, 'El teléfono debe tener exactamente 10 dígitos');
          return false;
        }

        // Todos los campos son válidos: retorna el objeto de datos para usarlo en el .then()
        return { nombre, email, empresa, telefono };
      },

    // .then(): se ejecuta cuando el usuario hace clic en "Enviar" y preConfirm() retornó datos válidos
    }).then(async result => {
      if (!result.isConfirmed || !result.value) return; // El usuario canceló o cerró el popup

      const { nombre, email, empresa, telefono } = result.value;

      // Muestra un popup de carga mientras se envía el email (no cierra solo, no permite interacción)
      Swal.fire({
        title: 'Enviando solicitud…',
        html: '<p style="color:#6c757d;font-size:0.9rem">Por favor espera un momento.</p>',
        allowOutsideClick: false,    // El usuario no puede cerrar el popup haciendo clic fuera
        allowEscapeKey: false,       // El usuario no puede cerrar con la tecla Escape
        showConfirmButton: false,    // No muestra el botón de confirmar (es una pantalla de carga)
        customClass: { popup: 'fswal-popup', title: 'fswal-title' },
        didOpen: () => Swal.showLoading(), // Muestra el spinner de carga de SweetAlert2
      });

      try {
        // emailjs.send(): envía el email a través de la API de EmailJS usando la plantilla configurada
        // Los parámetros del objeto corresponden a las variables {{nombre}}, {{email}}, etc. de la plantilla
        await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          {
            nombre:   nombre,
            empresa:  empresa || 'No especificada',   // Texto por defecto si el campo opcional estaba vacío
            email:    email,
            telefono: telefono || 'No especificado',  // Texto por defecto si el campo opcional estaba vacío
            asunto:   'Cotización: ' + item.nombre + ' (' + item.serie + ')',
            mensaje:  'Producto: ' + item.nombre + '\nSerie: ' + item.serie + '\nCategoría: ' + (item.categoriaNombre ?? 'N/A') + '\nDescripción: ' + item.descripcion,
          },
          EMAILJS_PUBLIC_KEY,
        );

        // Email enviado correctamente: muestra el popup de éxito
        Swal.fire({
          icon: 'success',
          title: '¡Solicitud enviada!',
          html: `
            <p style="font-size:0.92rem;color:#374151;line-height:1.65">
              Recibimos tu consulta sobre <strong>${item.nombre}</strong>.<br>
              Un ingeniero de ventas se pondrá en contacto contigo a la brevedad en
              <strong>${email} o</strong> al número <strong>${telefono}</strong>.
            </p>
          `,
          confirmButtonText: 'Cerrar',
          confirmButtonColor: '#1d4ed8',
          customClass: { popup: 'fswal-popup', title: 'fswal-title' },
        });

      } catch {
        // Error al enviar (fallo de red, credenciales de EmailJS inválidas, etc.): muestra popup de error
        Swal.fire({
          icon: 'error',
          title: 'No se pudo enviar',
          html: `
            <p style="font-size:0.9rem;color:#374151">
              Ocurrió un error al enviar tu solicitud. Por favor intenta de nuevo o contáctanos
              directamente a <strong>${VENTAS_EMAIL}</strong>.
            </p>
          `,
          confirmButtonText: 'Cerrar',
          confirmButtonColor: '#1d4ed8',
          customClass: { popup: 'fswal-popup', title: 'fswal-title' },
        });
      }
    });
  }

  // ── Métodos de validación (privados) ─────────────────────────────────────────

  // Valida el nombre del solicitante: mínimo 2 caracteres, máximo 80, solo letras latinas y símbolos permitidos
  // Retorna null si es válido, o un string con el mensaje de error si no lo es
  private validarNombre(nombre: string): string | null {
    if (nombre.length < 2)  return 'El nombre debe tener al menos 2 caracteres';
    if (nombre.length > 80) return 'El nombre no puede exceder 80 caracteres';
    // Permite letras con acento, ñ, espacios, guiones y apóstrofes — rechaza números y caracteres especiales
    if (!/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s\-']+$/.test(nombre))
      return 'El nombre solo puede contener letras, espacios, guiones y apóstrofes';
    return null;
  }

  // Valida el nombre de la empresa: mínimo 2 caracteres, máximo 100, permite letras, números y símbolos comerciales
  private validarEmpresa(empresa: string): string | null {
    if (empresa.length < 2)   return 'El nombre de empresa debe tener al menos 2 caracteres';
    if (empresa.length > 100) return 'El nombre de empresa no puede exceder 100 caracteres';
    // Permite alfanuméricos, tildes, ñ, espacios, guiones, puntos, comas, &, paréntesis y barras
    if (!/^[a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ\s\-'.,&()\/]+$/.test(empresa))
      return 'El nombre de empresa contiene caracteres no permitidos';
    return null;
  }

  // Valida el formato del email usando una regex estricta
  // Reglas: local válido, @ obligatorio, dominio con al menos un punto, TLD de 2-10 letras
  // El check !email.includes('..') rechaza puntos consecutivos que la regex no captura
  private validarEmail(email: string): boolean {
    // local@dominio.tld — local: letras/números/._+-, dominio: etiquetas separadas por punto,
    // sin punto inicial/final ni puntos consecutivos, TLD 2–10 letras
    return /^[a-zA-Z0-9][a-zA-Z0-9._%+\-]*@[a-zA-Z0-9]([a-zA-Z0-9\-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,10}$/.test(email)
      && !email.includes('..');
  }

  // Valida el teléfono mexicano: exactamente 10 dígitos numéricos
  private validarTelefono(telefono: string): boolean {
    return /^\d{10}$/.test(telefono);
  }

  // Devuelve el par de colores (fondo y texto) para el badge de serie del producto en el popup
  // Los colores están organizados por rangos de series para mantener consistencia visual con el catálogo
  private getSerieColor(serie: string): { bg: string; text: string } {
    const num = parseInt(serie.replace('Serie ', ''), 10);
    if (num >= 1000 && num < 2000) return { bg: '#e8f0fb', text: '#1565c0' }; // Azul — series de alivio de presión
    if (num >= 2000 && num < 2200) return { bg: '#f3f4f6', text: '#4b5563' }; // Gris — arrestadores de flama
    if (num >= 2200 && num < 3000) return { bg: '#e8f5e9', text: '#1b5e20' }; // Verde — formadores de espuma
    if (num >= 3000 && num < 4000) return { bg: '#ede7f6', text: '#4527a0' }; // Morado — ventilas de emergencia
    if (num >= 4000 && num < 6000) return { bg: '#fff3e0', text: '#e65100' }; // Naranja — medición de nivel
    if (num >= 6000)               return { bg: '#e0f2f1', text: '#006064' }; // Teal — cristales y visores
    return { bg: '#f3f4f6', text: '#374151' }; // Gris neutro como fallback
  }
}
