import { Component, inject } from '@angular/core';
import { TravelsService } from '../../Services/travels.service';
import { Travel } from '../../Models/Travel';
import { Router } from '@angular/router';
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
  titleModal = 'Crear Viaje';
  selectedTravelId: any = 0;
  loading = true;
  pageSize = 10;

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
  submitForm(): void {
    if (this.validateForm.valid) {
      console.log('submit', this.validateForm.value);
      const payload: Travel = {
        origin: this.validateForm.value.origin || '',
        destination: this.validateForm.value.destination || '',
        operatorTravel: this.validateForm.value.operatorTravel || '',
        startDate: this.validateForm.value.startDate || '',
        startTime: this.validateForm.value.startTime || new Date(),
        endDate: this.validateForm.value.endDate || '',
        endTime: this.validateForm.value.endTime || new Date(),
      };
      if (this.isEditing) {
        console.log('show ', this.selectedTravelId);
        payload.travelId = this.selectedTravelId;
        console.log('values ', payload);
        this.travelService.updateTravel(payload).subscribe({
          next: (data) => {
            if (data.isSuccess) {
              this.getTravelsList();
              this.isVisible = false;
              this.validateForm.reset();
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
              this.isVisible = false;
              this.validateForm.reset();
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

  showModal(): void {
    this.isVisible = true;
  }

  handleCancel(): void {
    this.isVisible = false;
    this.validateForm.reset();
  }

  onClickEditTravel(data: Travel): void {
    this.isEditing = true;
    this.selectedTravelId = data.travelId;
    console.log('1 asigned', this.selectedTravelId);
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
    this.showModal();
  }
  onClickCreateTravel() {
    this.isEditing = false;
    this.titleModal = 'Crear Viaje';
    this.validateForm.reset();
    this.showModal();
  }

  constructor(
    private router: Router,
    private _fb: NonNullableFormBuilder,
    private toastr: ToastrService
  ) {
    this.getTravelsList();
  }
}
