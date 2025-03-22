const Group = require('../models/groupModel');
const UserGroup = require('../models/userGroupModel');
const User = require('../models/userModel')
const sequelize = require('../util/database');
const jwt = require('jsonwebtoken');
exports.createGroup = async (req, res) => {
  const groupName = req.body.groupName;
  const userId = req.user.dataValues.id;

  try {
    // 1. Create the group
    const group = await Group.create({ name: groupName });

    // 2. Add the user as admin in the UserGroup table
    await UserGroup.create({
      userId: userId,
      groupId: group.id,
      role: 'admin'
    });

    return res.status(201).json({
      message: 'Group created successfully',
      group: {
        id: group.id,
        name: group.name
      }
    });

  } catch (err) {
    console.error('Error creating group:', err);
    return res.status(500).json({ message: 'Failed to create group' });
  }
};
exports.joinGroup=async(req, res)=>{
    const groupId = req.params.groupId;
    const userId = req.user.dataValues.id;
    const t = await sequelize.transaction();
    try{
     const response=   await UserGroup.create({
            userId: userId,
            groupId: groupId,
            role: 'member'
          },{transaction:t});
          console.log("created yay>>>>>>>>>", response)
          const response1 = await sequelize.query(`SELECT * FROM UserGroups;`)
          console.log(response1)
      await t.commit();
          return res.status(200).json({
            message: 'member added successfully'
          });
        
    }
    catch(error){
        await t.rollback();
        return res.status(500).json({ message: 'Failed to add member' });
        console.log(error);
    }
}
exports.getGroups=async(req, res)=>{
    console.log(">>>>>>>>>>>>>>>trying")
    const userId = req.user.dataValues.id;
    try{
    const groups = await UserGroup.findAll({
        where: { userId: userId },
        include: [
          {
            model: Group,
            attributes: ['name'], // Only select the name
          },
        ],
      });
      return res.status(200).json({groups});

    }
    catch(err){
        console.log(err)
 return res.status(500).json({ message: 'Database error' });
    }
}
//const { User, UserGroup } = require('../models');

exports.getMembers = async (req, res) => {
  const userId = req.user.dataValues.id;
  const groupId = req.params.groupId;

  try {
    const members= await sequelize.query(
      `SELECT u.name, u.email, u.id, ug.role
       FROM Users u
       JOIN UserGroups ug ON u.id = ug.userId
       WHERE ug.groupId = ?`,
      {
        replacements: [groupId],
        type: sequelize.QueryTypes.SELECT,
      }
    );
    {/*const formattedMembers = members.map(member => ({
      name: member.name,
      email: member.email,
      role: member.userGroups[0].role
    }));*/}

    return res.status(200).json({ members , userId});
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Database error' });
  }
};
exports.makeAdmin = async(req, res)=>{
  
}