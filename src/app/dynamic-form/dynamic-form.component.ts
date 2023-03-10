import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Observable, ReplaySubject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

export interface Technician {
  employee_name: string;
  id: string;
}

export interface Service {
  service_name: string;
  id: string;
  price: number;
}

// This will be used as a payload to send to the backend
export interface LineItemParams {
  technicianId: string;
  serviceIds: string[];
  additionalPrice: number;
}


@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss']
})
export class DynamicFormComponent implements OnInit {

  separatorKeysCodes: number[] = [ENTER, COMMA];

  serviceTechnicianForm: FormGroup;
  technicians: Technician[] = [];
  services: Service[] = [];
  filteredServices: (Observable<Service[]> | undefined)[] = [];
  selectedServices: (Service[] | undefined)[] =[];

  defaultLineItem = {
    services: [''],
    technician: '',
  };
  
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);


  lineItemParamsList: LineItemParams[] = [];
  lineItemsFormArray: FormArray;
  options: Technician[] = [
    {employee_name: 'John', id: '1'},
    {employee_name: 'Paul', id: '2'},
    {employee_name: 'George', id: '3'},
    {employee_name: 'Ringo', id: '4'},
  ];
  filteredTechnicians: (Observable<Technician[]> | undefined)[] = [];

  @ViewChild('fruitInput') fruitInput!: ElementRef<HTMLInputElement>;

  constructor(private formBuilder: FormBuilder) { 

    this.serviceTechnicianForm = this.formBuilder.group({
      lineItems: this.formBuilder.array([]),
    });
    this.lineItemsFormArray = this.serviceTechnicianForm.get("lineItems") as FormArray;
  }

  ngOnInit(): void { 
    this.lineItems.push(this.formBuilder.group(this.defaultLineItem));
    this.lineItemParamsList.push({
      technicianId: '',
      serviceIds: [],
      additionalPrice: 0,
    });
    this.technicians = [
      {employee_name: 'John', id: '1'},
      {employee_name: 'Paul', id: '2'},
      {employee_name: 'George', id: '3'},
      {employee_name: 'Ringo', id: '4'},
    ];
    this.services = [
      {service_name: 'Service 1', id: '1', price: 100},
      {service_name: 'Service 2', id: '2', price: 200},
      {service_name: 'Service 3', id: '3', price: 300},
      {service_name: 'Service 4', id: '4', price: 400},
      {service_name: 'Service 5', id: '5', price: 500},
    ];
    this.initTechnicianForm(0);
    this.initServiceItemForm(0);
  }  

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.unsubscribe();
  }  

  updateServiceIds(lineIndex: number): void {
    this.lineItemParamsList[lineIndex].serviceIds = this.selectedServices[lineIndex]?.map(service => service.id) || [];
  }

  updateTechnicianId(lineIndex: number, event: MatAutocompleteSelectedEvent): void {
    const technician = this.technicians.find(technician => technician.employee_name === event.option.value);
    this.lineItemParamsList[lineIndex].technicianId = technician?.id || '';
  }

  selectService(lineIndex: number, event: MatAutocompleteSelectedEvent): void {
    const selectedService = this.services.find(service => service.service_name === event.option.value);
    if (this.selectedServices[lineIndex] ===   undefined) {
      this.selectedServices[lineIndex] = [];
    }
    if (selectedService !== undefined) {
      this.selectedServices[lineIndex]?.push(selectedService);
      const arrayControl = this.serviceTechnicianForm.get("lineItems") as FormArray;
      arrayControl.at(lineIndex).get("services")?.setValue(null);
    }
    this.updateServiceIds(lineIndex);
  }

  removeService(lineIndex: number, serviceId: string): void {
    this.selectedServices[lineIndex] = this.selectedServices[lineIndex]?.filter(service => service.id !== serviceId);
  }  

  newLineItem(): FormGroup {
    return this.formBuilder.group(this.defaultLineItem);
  }

  initTechnicianForm(index: number): void {
    const arrayControl = this.serviceTechnicianForm.get("lineItems") as FormArray;

    this.filteredTechnicians[index] = arrayControl.at(index).get("technician")?.valueChanges.pipe(
      startWith(''),
      map(value => this.filterTechnicians(value || '')),
    );
  }

  initServiceItemForm(index: number): void {
    const arrayControl = this.serviceTechnicianForm.get("lineItems") as FormArray;

    this.filteredServices[index] = arrayControl.at(index).get("services")?.valueChanges.pipe(
      startWith(''),
      map(value => this.filterServices(value || '')),
    );    
  }

  onSubmit(): void {
    console.log(this.serviceTechnicianForm.value);
    console.log('lineItemParams:', this.lineItemParamsList);
  }  

  get lineItems(): FormArray {
    return this.serviceTechnicianForm.get("lineItems") as FormArray
  }

  public addLineItem(): void {
    this.lineItems.push(this.newLineItem());
    const index = this.lineItems.length - 1;
    this.initTechnicianForm(index);
    this.initServiceItemForm(index);
    this.lineItemParamsList[index] = {
      technicianId: '',
      serviceIds: [],
      additionalPrice: 0,
    };
  }
  
  public removeLineItem(index: number): void {
    this.lineItems.removeAt(index);
  }

  private filterTechnicians(value: string): Technician[] {
    const filterValue = value.toLowerCase();
    return this.technicians.filter(option => option.employee_name.toLowerCase().includes(filterValue));
  }

  private filterServices(service: string): Service[] {
    const filterValue = service.toLowerCase();
    return this.services.filter(service => service.service_name.toLowerCase().includes(filterValue));
  }  

}

