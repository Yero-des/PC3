import React, { Component } from 'react';
import axios from 'axios';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = ({
      prestamos: [],
      pos: null,
      titulo: 'Prestamos',
      subtitulo: 'Administrar prestamos',
      id: 0,
      id_libro: '',
      id_usuario: '',
      fecha_prestamo: '',
      fecha_devolucion: '',
    })

    this.cambioLibro = this.cambioLibro.bind(this);
    this.cambioUsuario = this.cambioUsuario.bind(this);
    this.cambioPrestamo = this.cambioPrestamo.bind(this);
    this.cambioDevolucion = this.cambioDevolucion.bind(this);

    this.guardar = this.guardar.bind(this);
    this.eliminar = this.eliminar.bind(this);
    this.mostrar = this.mostrar.bind(this);
  }
  
  componentDidMount() {
    this.listar();
  }

  cambioLibro(e) {
    this.setState(
      { id_libro: e.target.value }
    );
  }

  cambioUsuario(e) {
    this.setState(
      { id_usuario: e.target.value }
    );
  }

  cambioPrestamo(e) {
    this.setState(
      { fecha_prestamo: e.target.value }
    );
  }

  cambioDevolucion(e) {
    this.setState(
      { fecha_devolucion: e.target.value }
    );
  }

  listar() {
    axios.get('http://localhost:8000/api/prestamos/')
      .then((res) => {
        const prestamos = res.data;

        const promesasLibros = prestamos.map((prestamo) => {
          return axios.get(`http://localhost:8000/api/libros/${prestamo.id_libro}/`);
        });

        const promesasUsuarios = prestamos.map((prestamo) => {
          return axios.get(`http://localhost:8000/api/usuarios/${prestamo.id_usuario}/`);
        });

        Promise.all([...promesasLibros, ...promesasUsuarios])
          .then((responses) => {
            const libros = responses.slice(0, prestamos.length);
            const usuarios = responses.slice(prestamos.length);

            const prestamosHechos = prestamos.map((prestamo, index) => {

              const libro = libros[index].data;
              const usuario = usuarios[index].data;

              return {
                id: prestamo.id_prestamo,
                id_libro: libro.id_libro,
                titulo: libro.titulo,
                usuario: usuario.nombre,
                fecha_prestamo: prestamo.fecha_prestamo,
                fecha_devolucion: prestamo.fecha_devolucion,
              };

            });

            this.setState({ prestamos: prestamosHechos });
          })
          .catch((error) => {
            console.log(error.toString());
          });
      })
      .catch((error) => {
        console.log(error.toString());
      });
  }
  
  eliminar(cod) {
    let rpta = window.confirm("Desea eliminar el registro?");
    if (rpta) {
      axios.delete(`http://localhost:8000/api/prestamos/${cod}`)
      .then(res => {
        var temp = this.state.prestamos.filter((prestamo) => prestamo.id!== cod);
        this.setState({
          prestamos: temp,
        });
      });
    }
  }

  mostrar(cod, index) {
    axios.get(`http://localhost:8000/api/prestamos/${cod}`)
    .then(res => {
      this.setState({
        pos: index,
        titulo: 'Prestamos',
        id: res.data.id_prestamo,
        id_libro: res.data.id_libro,
        id_usuario: res.data.id_usuario,
        fecha_prestamo: res.data.fecha_prestamo,
        fecha_devolucion: res.data.fecha_devolucion,
      });
    });
  }

  guardar(e) {
    e.preventDefault();
    let cod = this.state.id;
    let datos = {
      id: this.state.id,
      id_libro: this.state.id_libro,
      id_usuario: this.state.id_usuario,
      fecha_prestamo: this.state.fecha_prestamo,
      fecha_devolucion: this.state.fecha_devolucion,
    }
    if(cod > 0) { // Editamos un registro
      console.log(cod);
      axios.put('http://localhost:8000/api/prestamos/'+ cod +'/', datos)
      .then(res => {
        let indx = this.state.pos;
        this.state.prestamos[indx] = res.data;
        var temp = this.state.prestamos;
        this.setState({
          pos: null,
          id: 0,
          id_libro: '',
          id_usuario: '',
          fecha_prestamo: '0',
          fecha_devolucion: '',
          prestamos: temp,
        });
      })
      .catch(error => {
        console.error('Error en la solicitud:', error);        
      });
    } else { // Nuevo registro
      axios.post('http://localhost:8000/api/prestamos/', datos)
      .then(res => {
        this.state.prestamos.push(res.data);
        var temp = this.state.prestamos;
        this.setState({
          id: 0,
          id_libro: '',
          id_usuario: '',
          fecha_prestamo: '',
          fecha_devolucion: '',
          prestamos: temp,
        })
      })
      .catch(error => {
        console.error('Error en la solicitud:', error);        
      });
    }
  }

  mostrarTabla() {
    return (
      <div className='text-center container'>
        
        <h1 className='m-4'>{this.state.titulo}</h1>

        <div className='row justify-content-center'>
          <div className='col-auto'>
            <table className='table table-striped' border="1">
            <thead>
              <tr>
                <th>Ejemplar</th>
                <th>Libro</th>
                <th>Cliente</th>                    
                <th>Inicio</th>                    
                <th>Fin</th>    
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>  
              {this.state.prestamos.map( (prestamo, index) => {
                return (
                  <tr key={prestamo.id}>                  
                    <td>{prestamo.id_libro}</td>
                    <td>{prestamo.titulo}</td>
                    <td>{prestamo.usuario}</td>
                    <td>{prestamo.fecha_prestamo}</td>
                    <td>{prestamo.fecha_devolucion}</td>
                    <td>
                      <button className='btn btn-secondary' onClick={()=>this.mostrar(prestamo.id,index)}>Editar</button>                     
                    </td>
                    <td>
                    <button className='btn btn-danger' onClick={()=>this.eliminar(prestamo.id)}>Eliminar</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            </table>
          </div>        
        </div>

        <form className='container' onSubmit={this.guardar}>
          <h1 className='m-4'>{this.state.subtitulo}</h1>
          <input type='hidden' value={this.state.id}/>
          <div className='row justify-content-center mb-3'>
            <div className='col-auto'>
              Ingrese ID libro:
            </div>
            <div className='col-auto'>
              <input className='form-control' type='number' value={this.state.id_libro} onChange={this.cambioLibro}/>
            </div>
          </div>
          <div className='row justify-content-center mb-3'>
            <div className='col-auto'>
              Ingrese ID usuario:
            </div>
            <div className='col-auto'>
              <input className='form-control' type='number' value={this.state.id_usuario} onChange={this.cambioUsuario}/>
            </div>
          </div>
          <div className='row justify-content-center mb-3'>
            <div className='col-auto'>
              Ingrese fecha de prestamo:
            </div>
            <div className='col-auto'>
              <input className='form-control' type='date' value={this.state.fecha_prestamo} onChange={this.cambioPrestamo}/>
            </div>
          </div>
          <div className='row justify-content-center mb-3'>
            <div className='col-auto'>
              Ingrese fecha de devolucion:
            </div>
            <div className='col-auto'>
              <input className='form-control' type='date' value={this.state.fecha_devolucion} onChange={this.cambioDevolucion}/>
            </div>
          </div>
          <p><input type='submit' className='btn btn-success'></input></p>
        </form>
        
        
      </div>
    );
  }

  render() {
    return this.mostrarTabla()
  }

}

export default App;
