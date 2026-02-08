-- Update user table enum to match Java constants
ALTER TABLE `user` 
MODIFY COLUMN `role` ENUM('RESPONSABLE','CHEF_PROJET','CONSULTANT') NOT NULL;

-- Update existing data to new enum values
UPDATE `user` SET `role` = 'RESPONSABLE' WHERE `role` = 'responsable';
UPDATE `user` SET `role` = 'CHEF_PROJET' WHERE `role` = 'chef-projet';
UPDATE `user` SET `role` = 'CONSULTANT' WHERE `role` = 'consultant';
