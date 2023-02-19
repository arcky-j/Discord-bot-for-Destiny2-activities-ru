module.exports = function generate_id(col){
    let id = '0451';
    const maxId = 10000;
    if (col.has(id)){
        do{
            id = Math.floor(Math.random() * maxId);
        } while (col.has(id))      
    }
    return id.toString();
}