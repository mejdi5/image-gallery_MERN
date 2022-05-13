import React, { useState, useEffect } from 'react'
import './App.css';
import { HiOutlineSwitchVertical } from 'react-icons/hi'
import { BsFillTrashFill } from 'react-icons/bs'
import classnames from "classnames";
import axios from 'axios'
import { useForm } from "react-hook-form";


interface Image {
  _id: number,
  title?: string,
  image: string,
  path: string
}

interface Errors {
  title?: string,
  image?: string
}

const App : React.FC = () => {

  const [show, setShow] = useState(false)
  const [images, setImages] = useState<Image[]>([])
  const { register, handleSubmit } = useForm();
  const [errors, setErrors] = useState<Errors>({});


  useEffect(() => {
    axios
    .get<Image[]>('http://localhost:5000/api', {headers: { Accept: 'application/json'}})
    .then(res => setImages(res.data))
    .catch(error => console.log(error.message))
  }, [])

  const onSubmit = async (data: any) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("image", data.image[0]);
    axios
    .post("http://localhost:5000/api/image", formData)
    .then((res) => {
        setImages(res.data);
        setErrors({});
    })
    .catch((error) => setErrors(error.response.data));
  };


  const handleDelete = async (id: number, e: React.FormEvent) => {
    e.preventDefault()
    if (window.confirm("do you want really to delete this image?")) {
      axios
        .delete(`http://localhost:5000/api/delete/${id}`)
        .then((res) => {
          setImages(res.data.data);
        })
        .catch((error) => {
          console.log(error.message);
        });
    }
  };
  

  return (
  <div className="App container p-4">
    <div className='form__index'>
    <HiOutlineSwitchVertical 
    style={{backgroundColor: 'white', color:'green', width:'20px', height:'20px', cursor:'pointer'}}
    onClick={() => setShow(!show)}
    />
      {show && 
      <form onSubmit={handleSubmit(onSubmit)}>
      <div className='form-group'>
        <input
        className={classnames("form-control mt-4", {"is-invalid": errors.title })} 
        placeholder='Set Image Title...'
        type="text"
        {...register("title")}
        />
        <div className="invalid-feedback">{errors.title}</div>
      </div>
      <div className='form-group'>
        <input 
        className={classnames("form-control mt-4", {"is-invalid": errors.image })} 
        type="file"
        {...register("image")}
        />
        <div className="invalid-feedback">{errors.image}</div>
      </div>
      <button className='btn btn-outline-primary sm mt-4'>Submit</button>
    </form>
      }
    </div>
    <div className='gallery__index'>
      <div className='row'>
        {images.length > 0 && images.map(image => 
        <div className='col-md-4 mt-4' key={image._id}>
          <div className="img-thumbnail head">
            <em style={{backgroundColor:'white'}}>
              {image.title}
            </em>
            <BsFillTrashFill
            className="trash"
            onClick={(e) => handleDelete(image._id, e)}
            />
          </div>
          <img 
          className="rounded img-thumbnail img"
          src={image.path} 
          alt={image.title}
          />
        </div>
        )}
      </div>
    </div>
  </div>
  );
}

export default App;
