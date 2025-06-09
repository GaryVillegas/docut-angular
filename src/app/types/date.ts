export interface cita {
  fechaSeleccionada: string;
  horaSeleccionada: string;
  idNegocio: string;
  idServicio: string;
  nombreUsuario: string;
  apellidoUsuario: string;
  idUsuario: string;
}

export interface getCita {
  id: string;
  citaData: cita;
}
