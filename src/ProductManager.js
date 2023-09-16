import fs from 'fs'

class ProductManager {
    constructor(path) {
        this.path = path
    }

    async getProducts(queryObj) {
        let {limit, order} = queryObj
        try {
            if (fs.existsSync(this.path)) {
                const info = await fs.promises.readFile(this.path, 'utf-8');
                const parsedInfo = JSON.parse(info)
                let limitedInfo = []

                // Validación para que el for no cree nulls si el limite del query es mayor a la cantidad de objetos.
                if(+limit > parsedInfo.length){
                    limit = parsedInfo.length
                }

                // Hacer una nueva lista de productos limitado al query pasado. 
                for(let i=0 ; i<+limit ; i++){
                    limitedInfo.push(parsedInfo[i])
                }

                return +limit > 0 
                ? limitedInfo
                : order === 'ASC' 
                ? parsedInfo.sort((a, b) => a.price - b.price) 
                : order === 'DESC'
                ? parsedInfo.sort((a, b) => b.price - a.price) 
                : parsedInfo
            } else {
                return []
            }
        } catch (error) {
            return error
        }
    }

    async codeValidator(arr, newCode) {
        let prodExists = await arr.find(prod => prod.code === newCode)
        return prodExists ? true : false
    }

    async addProduct(product) {
        try {
            let info = await this.getProducts({})
            if (await this.codeValidator(info, product.code)) {
                return "Error! El código identificador del producto ya existe. Revisar el producto."
            } else {
                let id = info.length ? info[info.length - 1].id + 1 : 1;
                const newProduct = { id, ...product };
                info.push(newProduct)
                await fs.promises.writeFile(this.path, JSON.stringify(info))
                return newProduct;
            }
        } catch (error) {
            return error
        }
    }

    async getProductById(id) {
        try {
            const info = await this.getProducts({});
            const search = info.find(prod => prod.id === id);
            return search;
        } catch (error) {
            return error
        }
    }

    async deleteProduct(id) {
        try {
            let info = await this.getProducts({})
            let newInfo = info.filter(prod => prod.id !== id)
            let prodRemoved = info.find(prod => prod.id === id)
            if (newInfo.length === info.length) {
                return undefined
            } else {
                await fs.promises.writeFile(this.path, JSON.stringify(newInfo))
                return prodRemoved;
            }
        } catch (error) {
            return error
        }
    }

    async updateProduct(id, changes) {
        try {
            let productsList = await this.getProducts({})
            let info = await this.getProductById(id)
            if(info) {
                let newInfo = { ...info, ...changes }
                productsList[id - 1] = { ...productsList[id - 1], ...newInfo }
                await fs.promises.writeFile(this.path, JSON.stringify(productsList))
                return newInfo;
            } else {
                return undefined
            }
        } catch (error) {
            return error
        }
    }

}

// Exporto una instancia de ProductManager
export const productsManager = new ProductManager('Products.json')
