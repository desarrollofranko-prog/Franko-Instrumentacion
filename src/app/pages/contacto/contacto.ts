// ── Importaciones del núcleo de Angular ──────────────────────────────────────

// ChangeDetectionStrategy: permite elegir entre detección de cambios Default (siempre) u OnPush (solo cuando cambia input/evento)
// Component: decorador que convierte una clase TypeScript en un componente Angular con template, estilos y metadata
// OnInit: interfaz de ciclo de vida; obliga a implementar ngOnInit(), que Angular llama una vez al crear el componente
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

// CommonModule: provee directivas estructurales (*ngIf, *ngFor, *ngClass, etc.) en componentes standalone
import { CommonModule } from '@angular/common';

// RouterModule: habilita routerLink y routerLinkActive en el template para navegar sin recargar la página
import { RouterModule } from '@angular/router';

// FormsModule: habilita el two-way binding [(ngModel)] para sincronizar los campos del formulario HTML con el objeto this.form
import { FormsModule } from '@angular/forms';

// emailjs: librería de terceros que envía emails directamente desde el navegador sin necesidad de backend propio
// Se comunica con la API de EmailJS usando service ID, template ID y public key
import emailjs from '@emailjs/browser';

// ── Decorador @Component ──────────────────────────────────────────────────────

@Component({
  selector: 'app-contacto',            // Nombre del tag HTML personalizado que representa este componente
  standalone: true,                    // Componente autónomo: no necesita ser declarado en un NgModule externo
  imports: [CommonModule, RouterModule, FormsModule], // Módulos disponibles dentro del template de este componente
  templateUrl: './contacto.html',      // Ruta al archivo HTML que define la estructura visual del componente
  styleUrl: './contacto.scss',         // Ruta al archivo SCSS con estilos encapsulados (no se filtran fuera del componente)
  changeDetection: ChangeDetectionStrategy.OnPush, // Angular solo re-renderiza este componente si cambia una referencia de input o se dispara un evento interno
})

// ── Clase del componente ──────────────────────────────────────────────────────

// Implementa OnInit para ejecutar lógica de inicialización justo cuando Angular crea el componente
export class Contacto implements OnInit {

  // ── Estado del horario de atención ───────────────────────────────────────

  // Booleano que indica si la empresa está abierta en este momento (true) o cerrada (false)
  // Se calcula comparando la hora actual con los rangos de apertura/cierre definidos en actualizarHorario()
  estaAbierto = false;

  // String que almacena la hora actual formateada como "HH:MM" en formato de 24h o 12h según locale
  // Se muestra visualmente junto al badge de "Abierto / Cerrado"
  horaActual = '';

  // ── Ciclo de vida: ngOnInit ───────────────────────────────────────────────

  // Angular llama a este método una sola vez después de inicializar las propiedades del componente
  ngOnInit(): void {
    this.actualizarHorario();                              // Calcula el estado abierto/cerrado inmediatamente al cargar la página
    setInterval(() => this.actualizarHorario(), 60_000);  // Recalcula cada 60 segundos (60,000 ms) para mantener el badge actualizado sin recargar
  }

  // ── Lógica de horario de atención ────────────────────────────────────────

  // Calcula si la empresa está abierta en este instante y actualiza estaAbierto y horaActual
  private actualizarHorario(): void {
    const ahora = new Date();                 // Crea un objeto Date con la fecha y hora actuales del sistema del usuario
    const dia   = ahora.getDay();            // Obtiene el día de la semana como número: 0=Domingo, 1=Lunes, ... 6=Sábado
    const hora  = ahora.getHours();          // Obtiene la hora actual en formato 24h (0–23)
    const min   = ahora.getMinutes();        // Obtiene los minutos actuales (0–59)

    // Convierte hora y minutos a un único número de minutos desde medianoche
    // Esto simplifica las comparaciones de rangos de horario (evita manejar dos valores separados)
    const totalMinutos = hora * 60 + min;

    const apertura    = 9 * 60;        // 9:00 am expresado en minutos totales desde medianoche (= 540)
    const cierre      = 18 * 60;       // 6:00 pm expresado en minutos totales (= 1080)
    const cierreSab   = 14 * 60;       // 2:00 pm del sábado expresado en minutos totales (= 840)

    // true si es lunes a viernes (dia 1–5) Y la hora actual está dentro del rango de apertura (>= 9:00 y < 18:00)
    const semana      = dia >= 1 && dia <= 5 && totalMinutos >= apertura && totalMinutos < cierre;

    // true si es sábado (dia === 6) Y la hora actual está dentro del rango especial (>= 9:00 y < 14:00)
    const sabado      = dia === 6      && totalMinutos >= apertura && totalMinutos < cierreSab;

    // La empresa está abierta si se cumple el horario de semana O el de sábado
    this.estaAbierto  = semana || sabado;

    // Formatea la hora actual como string "HH:MM" usando el locale español de México
    // hour: '2-digit' y minute: '2-digit' garantizan el formato con cero a la izquierda (ej. "09:05")
    this.horaActual  = ahora.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  }

  // ── Modelo del formulario de contacto ────────────────────────────────────

  // Objeto que refleja todos los campos del formulario HTML mediante two-way binding [(ngModel)]
  // Cada propiedad se inicializa como string vacío para que los inputs empiecen limpios
  form = {
    nombre:   '',   // Campo: nombre completo del solicitante
    empresa:  '',   // Campo opcional: razón social o nombre de la empresa
    email:    '',   // Campo: correo electrónico para recibir la respuesta
    telefono: '',   // Campo opcional: número de teléfono de 10 dígitos
    asunto:   '',   // Campo: categoría del motivo de contacto (seleccionado en un <select>)
    mensaje:  '',   // Campo: cuerpo del mensaje o consulta
  };

  // ── Estados de la interfaz de usuario ────────────────────────────────────

  enviado  = false;  // true después de que EmailJS confirma el envío exitoso; muestra la pantalla de éxito
  enviando = false;  // true mientras la petición a EmailJS está en vuelo; deshabilita el botón para evitar doble envío
  error    = false;  // true si EmailJS lanza una excepción; muestra la pantalla de error al usuario

  // Diccionario de mensajes de error de validación indexados por nombre de campo
  // Ejemplo: { nombre: 'El nombre es requerido.', email: 'Ingresa un correo válido.' }
  // Si no hay errores, el objeto está vacío {}
  errores: { [k: string]: string } = {};

  // ── Expresiones regulares de validación (constantes privadas) ────────────

  // Valida nombres: permite letras latinas (incluyendo acentos y ñ), espacios, guiones y apóstrofes
  // Longitud mínima 2, máxima 80 caracteres
  private readonly RE_NOMBRE   = /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s\-']{2,80}$/;

  // Valida emails: formato básico usuario@dominio.extensión
  // [^\s@]+ garantiza que no haya espacios ni @ antes y después del @
  // [a-zA-Z]{2,} requiere extensión de al menos 2 letras (.mx, .com, .org, etc.)
  private readonly RE_EMAIL    = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

  // Valida teléfonos mexicanos: exactamente 10 dígitos numéricos, sin guiones ni espacios
  private readonly RE_TELEFONO = /^\d{10}$/;

  // ── Validación del formulario ─────────────────────────────────────────────

  // Valida todos los campos del formulario y llena this.errores con los mensajes de error encontrados
  // Retorna true si el formulario es válido (sin errores), false si hay al menos un error
  private validar(): boolean {
    this.errores = {}; // Reinicia el objeto de errores antes de cada validación (borra errores del intento anterior)
    const f = this.form; // Alias local para reducir repetición de "this.form"

    // Valida el campo nombre: primero verifica que no esté vacío, luego que pase la regex
    if (!f.nombre.trim())                           // trim() elimina espacios en blanco al inicio y al final antes de comprobar si está vacío
      this.errores['nombre'] = 'El nombre es requerido.';
    else if (!this.RE_NOMBRE.test(f.nombre.trim())) // test() retorna true si el string cumple el patrón de la regex
      this.errores['nombre'] = 'Solo se permiten letras y espacios.';

    // Valida el campo email: primero verifica que no esté vacío, luego el formato
    if (!f.email.trim())
      this.errores['email'] = 'El correo es requerido.';
    else if (!this.RE_EMAIL.test(f.email.trim()))
      this.errores['email'] = 'Ingresa un correo válido (ej. usuario@dominio.com).';

    // Valida el teléfono SOLO si el usuario escribió algo (es un campo opcional)
    // Si está vacío se omite; si tiene contenido, debe ser exactamente 10 dígitos
    if (f.telefono.trim() && !this.RE_TELEFONO.test(f.telefono.trim()))
      this.errores['telefono'] = 'El teléfono debe tener exactamente 10 dígitos.';

    // Valida que el usuario haya seleccionado un asunto en el <select>
    // Un <select> sin selección devuelve '' (cadena vacía), que es falsy
    if (!f.asunto)
      this.errores['asunto'] = 'Selecciona un asunto.';

    // Valida el mensaje: no vacío y con al menos 10 caracteres de contenido real
    if (!f.mensaje.trim())
      this.errores['mensaje'] = 'El mensaje es requerido.';
    else if (f.mensaje.trim().length < 10)           // .length cuenta caracteres Unicode del string
      this.errores['mensaje'] = 'El mensaje debe tener al menos 10 caracteres.';

    // Object.keys() retorna un array con los nombres de propiedades del objeto
    // Si el array está vacío (length === 0), todos los campos son válidos
    return Object.keys(this.errores).length === 0;
  }

  // ── Filtro del campo teléfono ─────────────────────────────────────────────

  // Se dispara en el evento (input) del campo teléfono para permitir solo dígitos en tiempo real
  filtrarTelefono(event: Event): void {
    const input = event.target as HTMLInputElement; // Obtiene la referencia al elemento <input> que disparó el evento
    input.value = input.value.replace(/\D/g, '').slice(0, 10); // \D reemplaza cualquier carácter no-dígito por vacío; slice(0,10) limita a 10 caracteres
    this.form.telefono = input.value;               // Sincroniza el valor limpio con el modelo del formulario (porque el filtro bypassea ngModel)
  }

  // ── Envío del formulario ──────────────────────────────────────────────────

  // Método asíncrono que valida el formulario y lo envía mediante la API de EmailJS
  // async/await permite escribir código asíncrono con sintaxis similar a código sincrónico
  async enviarFormulario() {
    if (!this.validar()) return; // Si la validación falla, detiene la ejecución y muestra los errores en el template

    this.enviando = true;  // Activa el indicador de carga (spinner en el botón) y deshabilita el botón de envío
    this.error = false;    // Reinicia el estado de error de envíos anteriores fallidos

    try {
      // emailjs.send() hace una petición HTTP POST a la API de EmailJS con los parámetros del template
      // Retorna una Promise que resuelve si el email se envía o rechaza si hay un error de red o de autenticación
      await emailjs.send(
        'service_6dpcpyq',    // Service ID: identifica la cuenta de correo configurada en el dashboard de EmailJS
        'template_e9fnael',   // Template ID: identifica la plantilla de email con variables {{nombre}}, {{mensaje}}, etc.
        {
          // Parámetros del template: cada clave debe coincidir con las variables {{clave}} definidas en EmailJS
          nombre:   this.form.nombre,                       // Nombre del remitente
          empresa:  this.form.empresa || 'No especificada', // Si empresa está vacía, usa texto por defecto (operador OR lógico)
          email:    this.form.email,                        // Correo del remitente (EmailJS lo usa para Reply-To)
          telefono: this.form.telefono || 'No especificado', // Si teléfono está vacío, usa texto por defecto
          asunto:   this.form.asunto,                       // Asunto seleccionado por el usuario
          mensaje:  this.form.mensaje,                      // Cuerpo del mensaje
        },
        'Q6H7SXxngUpg-8PjC'  // Public Key: credencial pública de la cuenta EmailJS (equivale al API key del lado del cliente)
      );

      this.enviando = false; // Desactiva el indicador de carga al completarse la promesa
      this.enviado  = true;  // Activa el estado de éxito; el template mostrará la pantalla de confirmación

    } catch {
      // El bloque catch captura cualquier error de red, autenticación o configuración de EmailJS
      this.enviando = false; // Desactiva el indicador de carga aunque haya fallado
      this.error    = true;  // Activa el estado de error; el template mostrará el mensaje de error al usuario
    }
  }

  // ── Reset del formulario ──────────────────────────────────────────────────

  // Restaura el formulario a su estado inicial para permitir enviar otro mensaje
  resetForm() {
    // Reemplaza el objeto form con uno nuevo de valores vacíos (no muta el original, crea una nueva referencia)
    this.form = { nombre: '', empresa: '', email: '', telefono: '', asunto: '', mensaje: '' };
    this.enviado = false; // Oculta la pantalla de éxito y vuelve a mostrar el formulario
    this.error   = false; // Oculta la pantalla de error y vuelve a mostrar el formulario
  }
}
