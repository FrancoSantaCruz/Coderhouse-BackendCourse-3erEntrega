import express from 'express';
// Importo una instancia de ProductManager. No la clase.
import { productsManager } from './ProductManager.js'

// Debo especificar en mi package.json que voy a trabajar con ES Module ya que nodejs trabaja
// con import de forma nativa, y nosotros queremos trabajar con ES Module. 
// "type": "module",

// Activo el módulo express para poder hacer uso de ella e iniciar el servidor.
const app = express();

// Para que nuestro servidor express pueda interpretar en forma automática mensajes de tipo JSON en formato urlencoded (req.body)
// debemos indicarlo en forma explícita, agregando las siguientes lineas luego de crearlo. 
app.use(express.json())
app.use(express.urlencoded({extended:true}))


// Asignar un puerto al que el servidor debe escuchar para las peticiones.
app.listen(8080, () => {
    console.log("Listening server on port 8080.");
});

app.get('/', (req, res) => {
    res.send("Bienvenidos");
})

app.get('/products', async(req, res) => {
    try {
        const products = await productsManager.getProducts(req.query)
        if(!products.length){
            res.status(200).json({message: 'No products found.'})
        } else {
            res.status(200).json({message:'Products found', products})
        }
    } catch (error) {
        // Si entra en el catch, significa que hubo un error en getProducts, por lo tanto devolvemos un error 500. 
        res.status(500).json({message: error})
    }
})

app.get('/products/:pid', async(req,res) => {
    const {pid} = req.params;
    try {
        const product = await productsManager.getProductById(+pid)
        if(!product){
            res.status(400).json({message:'Product not found with the ID sent.'})
        } else {
            res.status(200).json({message:'Product found.', product})
        }
    } catch (error) {
        res.status(500).json({message: error})
    }

})

app.post('/products', async (req,res) => {

    // Buscamos validar la existencia de los campos obligatorios enviados por body.
    // Lo hacemos preferentemente en la ruta previo a la ejecución del método asincrónico
    // al ser totalmente innecesario ejecutar tanta lógica si podemos validar previamente.
    const {title, description, price, thumbnail, code, stock} = req.body
    if(!title || !description || !price || !thumbnail || !code || !stock){
        return res.status(400).json({message: 'Some data is missing.'})
    }
    try {
        const newProduct = await productsManager.addProduct(req.body)
        res.status(200).json({message:'Product added', product: newProduct})
    } catch (error) {
        res.status(500).json({message: error})
    }
})

app.delete('/products/:pid', async(req,res) => {
    const {pid} = req.params
    try {
        const product = await productsManager.deleteProduct(+pid)
        if(!product){
            res.status(400).json({message:'Product not found with the ID sent.'})
        } else {
            res.status(200).json({message:'Product deleted successfully', productDeleted : product})
        }
    } catch (error) {
        res.status(500).json({message: error})
    }
})

app.put('/products/:pid', async(req,res) => {
    const {pid} = req.params
    try {
        const prodUpdated = await productsManager.updateProduct(+pid, req.body)
        if(!prodUpdated){
            res.status(400).json({message:'Product not found with the ID sent or the information is invalid.'})
        } else{ 
            res.status(200).json({message:'Product updated.', ProductUpdated : prodUpdated})
        }
    } catch (error) {
        res.status(500).json({ message: error })
    }
})