// Resource.js
class Resource {

  constructor(data = {}) {

    // If it's a Sequelize model, extract its plain data
    const plain = typeof data.get === 'function' ? data.get({ plain: true }) : data;

    // Flatten all props into this object
    Object.assign(this, plain);
  }

  toArray() {
    return {};
  }
}

module.exports = Resource;
