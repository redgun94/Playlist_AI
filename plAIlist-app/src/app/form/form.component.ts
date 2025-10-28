import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-form',
  imports: [FormsModule],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css'
})
export class FormComponent {

  user = {
    name : "",
    email: "",
    edad: null
  }

  
  enviarFormulario(){
    console.log("Formulario enviado", this.user.name);

  }
  
}
