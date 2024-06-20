import { Component, inject } from '@angular/core';
import { TravelsService } from '../../Services/travels.service';
import { Travel } from '../../Models/Travel';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';

import { NgFor } from '@angular/common';

import {
  FormControl,
  FormsModule,
  FormGroup,
  Validators,
  NonNullableFormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';

import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import moment from 'moment';
import { provideToastr } from 'ngx-toastr';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-travels',
  standalone: true,
  imports: [
    NzModalModule,
    NzGridModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzDatePickerModule,
    FormsModule,
    NzSpaceModule,
    NzTimePickerModule,
    NgFor,
  ],
  templateUrl: './travels.component.html',
  styleUrl: './travels.component.css',
})
export class TravelsComponent {
  constructor(
    private _fb: NonNullableFormBuilder,
    private toastr: ToastrService
  ) {
    this.getTravelsList();
  }
  public get fb(): NonNullableFormBuilder {
    return this._fb;
  }
  public set fb(value: NonNullableFormBuilder) {
    this._fb = value;
  }
  private travelService = inject(TravelsService);
  public travelList: Travel[] = [];

  isVisible = false;
  isEditing = false;
  isLoading = false;
  titleModal = 'Crear Viaje';
  selectedTravelId: any = 0;

  startTime = new Date().toUTCString();
  endTime = new Date().toUTCString();

  showSuccess(title: string, mesage: string) {
    this.toastr.success(mesage, title);
  }
  showError(title: string, message: string) {
    this.toastr.error(message, title);
  }

  getTravelsList() {
    this.travelService.getTravelsList().subscribe({
      next: (data: Array<Travel>) => {
        if (data.length > 0) {
          // const arrayList: Array = data
          this.travelList = data.map((item) => {
            return {
              travelId: item.travelId,
              origin: item.origin,
              destination: item.destination,
              operatorTravel: item.operatorTravel,
              startDate: moment(item.startDate).format('YYYY-MM-DD'),
              endDate: moment(item.endDate).format('YYYY-MM-DD'),
              startTime: moment(item.startTime).format('HH:mm'),
              endTime: moment(item.endTime).format('HH:mm'),
            };
          });
        }
      },
      error: (err) => {
        console.log(err.message);
        this.showError('Error', 'Ocurrio un error');
      },
    });
  }
  checkDateBefore(start: any, end: any) {
    var mStart = moment(start);
    var mEnd = moment(end);
    return mStart.isBefore(mEnd);
  }

  onSubmitForm(): void {
    if (this.validateForm.valid) {
      if (
        this.checkDateBefore(
          this.validateForm.value.startDate,
          this.validateForm.value.endDate
        )
      ) {
        const payload: Travel = {
          origin: this.validateForm.value.origin || '',
          destination: this.validateForm.value.destination || '',
          operatorTravel: this.validateForm.value.operatorTravel || '',
          startDate: this.validateForm.value.startDate || '',
          startTime: this.validateForm.value.startTime || new Date(),
          endDate: this.validateForm.value.endDate || '',
          endTime: this.validateForm.value.endTime || new Date(),
        };
        this.isLoading = true;
        if (this.isEditing) {
          payload.travelId = this.selectedTravelId;
          this.travelService.updateTravel(payload).subscribe({
            next: (data) => {
              if (data.isSuccess) {
                this.getTravelsList();
                this.showSuccess(
                  'Actualizado',
                  'Datos actualizados correctamente'
                );
              } else {
                this.showError('Error', 'No se pudo actualizar el viaje');
              }
            },
            error: (err) => {
              console.log(err.message);
              this.showError('Error', 'No se pudo actualizar el viaje');
            },
          });
        }
        if (!this.isEditing) {
          this.travelService.createTravel(payload).subscribe({
            next: (data) => {
              if (data.isSuccess) {
                this.getTravelsList();
                this.showSuccess('Creado', 'Datos guardados correctamente');
              } else {
                this.showError('Error', 'No se pudo crear el viaje');
              }
            },
            error: (err) => {
              console.log(err.message);
              this.showError('Error', 'No se pudo crear el viaje');
            },
          });
        }
        setTimeout(() => {
          this.onCloseModal();
          this.validateForm.reset();
          this.isLoading = false;
        }, 1000);
      } else {
        this.showError(
          'Error',
          'La fecha final no puede ser menor a la fecha inicial'
        );
      }
    } else {
      Object.values(this.validateForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }
  validateForm: FormGroup<{
    origin: FormControl<string>;
    destination: FormControl<string>;
    operatorTravel: FormControl<string>;
    startDate: FormControl<string>;
    startTime: FormControl<Date>;
    endDate: FormControl<string>;
    endTime: FormControl<Date>;
  }> = this.fb.group({
    origin: ['', [Validators.required]],
    destination: ['', [Validators.required]],
    operatorTravel: ['', [Validators.required]],
    startDate: ['', [Validators.required]],
    startTime: [new Date(), [Validators.required]],
    endDate: ['', [Validators.required]],
    endTime: [new Date(), [Validators.required]],
  });

  onShowModal(): void {
    this.isVisible = true;
  }

  onCloseModal(): void {
    this.isVisible = false;
    this.validateForm.reset();
  }

  onClickEditTravel(data: Travel): void {
    this.isEditing = true;
    this.selectedTravelId = data.travelId;
    this.titleModal = 'Editar Viaje';
    this.validateForm.setValue({
      origin: data.origin,
      destination: data.destination,
      operatorTravel: data.operatorTravel,
      // @ts-ignore
      startDate: moment(moment(data.startDate).format('YYYY-MM-DD')).toDate(),
      startTime: new Date(data.startDate + ' ' + data.startTime),
      // @ts-ignore
      endDate: moment(moment(data.endDate).format('YYYY-MM-DD')).toDate(),
      endTime: new Date(data.endDate + ' ' + data.endTime),
    });
    this.onShowModal();
  }
  onClickCreateTravel() {
    this.isEditing = false;
    this.titleModal = 'Crear Viaje';
    this.validateForm.reset();
    this.onShowModal();
  }
}
