import { Component, Input, Output, EventEmitter } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-action-confirm',
  standalone: true,
  template: ''
})
export class ActionConfirmComponent {
  @Input() nombre: string = '';
  @Input() mensaje: string = '';
  @Input() tipo: 'eliminar' | 'crear' | 'editar' = 'eliminar';
  @Input() id: number | null = null;
  @Output() confirmAction = new EventEmitter<number | null>();

  showConfirm() {
    let config: any = {
      title: '',
      html: '',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '',
      cancelButtonText: 'Cancelar'
    };

    switch (this.tipo) {
      case 'eliminar':
        config.title = '¿Estás seguro?';
        config.html = this.mensaje || `¿Deseas eliminar <strong>${this.nombre}</strong>?<br>Esta acción no se puede deshacer.`;
        config.icon = 'warning';
        config.confirmButtonText = 'Sí, eliminar';
        break;
      case 'crear':
        config.title = 'Confirmar creación';
        config.html = this.mensaje || `¿Deseas crear <strong>${this.nombre}</strong>?`;
        config.confirmButtonText = 'Sí, crear';
        break;
      case 'editar':
        config.title = 'Confirmar edición';
        config.html = this.mensaje || `¿Deseas editar <strong>${this.nombre}</strong>?`;
        config.confirmButtonText = 'Sí, editar';
        break;
    }

    Swal.fire(config).then((result) => {
      if (result.isConfirmed) {
        this.confirmAction.emit(this.id);
      }
    });
  }
}
