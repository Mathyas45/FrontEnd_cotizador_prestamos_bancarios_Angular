import { Cliente } from "./cliente.model";

export interface SolicitudPrestamo {
    id?: number;
    monto : number;
    montoCuotaInicial : number;
    porcentajeCuotaInicial : number;
    montoFinanciar : number;
    plazoAnios : number;
    tasaInteres : number;
    tcea : number;
    cuotaMensual : number;
    motivoRechazo?: string;
    estado : number; // 1 = aprobado, 0 = rechazado, 2 = pendiente
    cliente: Cliente;
    createdAt?: Date | string;
}

export interface SolicitudPrestamoCreateDto {
    monto : number;
    porcentajeCuotaInicial : number;
    plazoAnios : number;
    clienteId: number;
}

export interface SolicitudPrestamoUpdateDto {
    monto?: number;
    porcentajeCuotaInicial?: number;
    plazoAnios?: number;
    clienteId?: number;
}