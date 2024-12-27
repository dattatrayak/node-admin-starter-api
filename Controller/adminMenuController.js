const AdminMenu = require('../Models/AdminMenu');
const { Op } = require('sequelize');

exports.addMenu = async (req, res) => {
  try {
    const { name, heading, url, icon, parent_id, order } = req.body;

    // Check if URL already exists
    const existingMenu = await AdminMenu.findOne({ where: { url } });
    if (existingMenu) {
      return res.status(400).json({ message: 'URL already in use' });
    }

    const menu = await AdminMenu.create({ name, heading, url, icon, parent_id, order });
    res.status(201).json({ message: 'Menu added successfully', menu });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
 };

 const getNestedMenus = async (parentId = null) => {
  const menus = await AdminMenu.findAll({
    where: { parent_id: parentId },
    order: [['order', 'ASC']],
    include: [
      {
        model: AdminMenu,
        as: 'SubMenus',
        include: [
          {
            model: AdminMenu,
            as: 'SubMenus',
            include: [
              {
                model: AdminMenu,
                as: 'SubMenus',
                include: [
                  {
                    model: AdminMenu,
                    as: 'SubMenus'
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  });

  return menus;
};

exports.menuChildParent = async (req, res) => {
  try {
    const menus = await getNestedMenus();
    res.json(menus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
  
exports.listMenus = async (req, res) => {
  try {
    // Parse query parameters with defaults
    const { page = 1, limit = 10, search = '' } = req.query;

    // Ensure `page` is at least 1
    const currentPage = Math.max(parseInt(page), 1); // Ensures page >= 1
    const currentLimit = parseInt(limit);

    const offset = (currentPage - 1) * currentLimit;

    // Add search conditions
    const where = search
      ? {
          [Op.or]: [
            { name: { [Op.like]: `%${search}%` } },
            { heading: { [Op.like]: `%${search}%` } },
          ],
        }
      : {};

    // Fetch paginated data
    const { count, rows } = await AdminMenu.findAndCountAll({
      where,
      limit: currentLimit,
      offset,
      order: [['order', 'ASC']],
    });

    // Send response
    res.json({
      totalItems: count,
      totalPages: Math.ceil(count / currentLimit),
      currentPage,
      menus: rows,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

  exports.updateMenu = async (req, res) => {
    try {
      const { id } = req.params;
      const { name, heading, url, icon, parent_id, order } = req.body;
  
      // Check if URL already exists for another menu
      const existingMenu = await AdminMenu.findOne({ where: { url, id: { [Op.ne]: id } } });
      if (existingMenu) {
        return res.status(400).json({ message: 'URL already in use' });
      }
  
      const menu = await AdminMenu.findByPk(id);
      if (!menu) {
        return res.status(404).json({ message: 'Menu not found' });
      }
  
      menu.name = name;
      menu.heading = heading;
     // menu.url = url;
      menu.icon = icon;
      menu.parent_id = parent_id;
      menu.order = order;
      menu.updated_at = new Date();
  
      await menu.save();
      res.status(200).json({ message: 'Menu updated successfully', menu });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }; 

exports.getBreadcrumbs = async (req, res) => {
  try {
    const { url } = req.body; 
    const breadcrumbs = []; 
    let currentMenu = await AdminMenu.findOne({ where: { url } }); 
    if (!currentMenu) {
        throw new Error('Menu not found');
    }

    while (currentMenu) {
        breadcrumbs.unshift({ name: currentMenu.name, url: currentMenu.url });
        currentMenu = await AdminMenu.findOne({ where: { id: currentMenu.parent_id } });
    }
     res.status(201).json({ data: breadcrumbs });
    return ;
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
 };

 const getDropdownMenus = async (parentId = null) => {
  const menus = await AdminMenu.findAll({
      where: { parent_id: parentId },
      order: [['order', 'ASC']],
  });

  const formattedMenus = [];
  for (const menu of menus) {
      const children = await getDropdownMenus(menu.id); // Recursively fetch children
      formattedMenus.push({
          id: menu.id,
          name: menu.name,
          children,
      });
  }
  return formattedMenus;
};

exports.menuChildParentDropdown = async (req, res) => {
  try {
    const menus = await getDropdownMenus();
    res.status(201).json({ data: menus });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

