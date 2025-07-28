import React, { useState } from 'react';
import styles from '../Dashboard/FormStyles.module.css';
import { 
  FaFileAlt, FaClipboardCheck, FaFileSignature, FaFileInvoiceDollar, FaFileContract,
  FaHardHat, FaRuler, FaCamera, FaHome, FaWrench, FaPaintRoller, FaClipboard, FaTruck,
  FaCalendarCheck, FaShieldAlt, FaHandshake, FaMapMarkedAlt, FaCalculator, FaGoogle, FaCalendarAlt,
  FaEdit, FaCheck, FaHourglass, FaRegClock
} from 'react-icons/fa';
import { MdRoofing, MdOutlinePermContactCalendar, MdOutlineAssignment } from 'react-icons/md';
import { GiSteelClaws, GiHammerNails, GiStoneCrafting } from 'react-icons/gi';
import { BsFillLightningFill, BsPencilSquare } from 'react-icons/bs';

interface Task {
  id: string;
  name: string;
  completed: boolean;
  status?: 'completed' | 'ongoing' | 'remaining';
}

interface ProgressBarProps {
  tasks: Task[];
}

interface TaskStatus {
  status: 'completed' | 'ongoing' | 'remaining';
  message: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ tasks: initialTasks }) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    setActiveTaskId(null); // Reset active task when toggling
    setShowStatusDropdown(false);
  };
  
  const handleTaskClick = (taskId: string) => {
    if (activeTaskId === taskId) {
      setActiveTaskId(null); // Toggle off if already active
    } else {
      setActiveTaskId(taskId); // Set as active
    }
    setShowStatusDropdown(false); // Close dropdown when selecting a different task
  };
  
  const handleEditClick = () => {
    setShowStatusDropdown(!showStatusDropdown);
  };
  
  const updateTaskStatus = (status: 'completed' | 'ongoing' | 'remaining') => {
    if (activeTaskId) {
      setTasks(prevTasks => 
        prevTasks.map(task => {
          if (task.id === activeTaskId) {
            return {
              ...task,
              completed: status === 'completed',
              status: status
            };
          }
          return task;
        })
      );
      setShowStatusDropdown(false);
    }
  };
  
  // Get the appropriate icon color based on task status
  const getIconColor = (taskId: string): string => {
    const task = tasks.find(t => t.id === taskId);
    if (task?.completed) {
      return '#059669'; // Green for completed
    } else if (['5', '6', '10', '11'].includes(taskId)) {
      return '#2563eb'; // Blue for ongoing
    } else {
      return '#ea580c'; // Orange for remaining
    }
  };
  
  const getTaskStatus = (task: Task): TaskStatus => {
    if (task.status) {
      // If task has an explicitly set status, use it
      return {
        status: task.status,
        message: task.status === 'completed' ? 'Completed' : 
                 task.status === 'ongoing' ? 'In Progress' : 'Not Started'
      };
    } else if (task.completed) {
      return { 
        status: 'completed', 
        message: 'Completed' 
      };
    } else if (['5', '6'].includes(task.id)) {
      // For demo purposes, let's assume these specific tasks are ongoing
      return { 
        status: 'ongoing', 
        message: 'In Progress' 
      };
    } else {
      return { 
        status: 'remaining', 
        message: 'Not Started' 
      };
    }
  };
  
  // Function to get appropriate icon for each task
  const getTaskIcon = (taskName: string, completed: boolean) => {
    const taskNameLower = taskName.toLowerCase();
    const iconSize = 18;
    
    // Match specific task names from the list
    if (taskNameLower.includes('g drive')) {
      return <FaGoogle size={iconSize} style={{ color: completed ? '#059669' : '#4285F4' }} />;
    } else if (taskNameLower.includes('pre bid')) {
      return <FaFileContract size={iconSize} style={{ color: completed ? '#059669' : '#3B82F6' }} />;
    } else if (taskNameLower.includes('calendar')) {
      return <FaCalendarAlt size={iconSize} style={{ color: completed ? '#059669' : '#8B5CF6' }} />;
    } else if (taskNameLower.includes('job walk')) {
      return <FaMapMarkedAlt size={iconSize} style={{ color: completed ? '#059669' : '#EC4899' }} />;
    } else if (taskNameLower.includes('project index')) {
      return <MdOutlineAssignment size={iconSize} style={{ color: completed ? '#059669' : '#6366F1' }} />;
    } else if (taskNameLower.includes('bid form')) {
      return <BsPencilSquare size={iconSize} style={{ color: completed ? '#059669' : '#10B981' }} />;
    } else if (taskNameLower.includes('pricing')) {
      return <FaCalculator size={iconSize} style={{ color: completed ? '#059669' : '#F59E0B' }} />;
    } else if (taskNameLower.includes('bid bond')) {
      return <FaFileSignature size={iconSize} style={{ color: completed ? '#059669' : '#EF4444' }} />;
    }
    
    // Fallback to generic icons based on keywords
    else if (taskNameLower.includes('roof') && taskNameLower.includes('install')) {
      return <MdRoofing size={iconSize} />;
    } else if (taskNameLower.includes('roof') && taskNameLower.includes('repair')) {
      return <GiSteelClaws size={iconSize} />;
    } else if (taskNameLower.includes('roof') && taskNameLower.includes('inspect')) {
      return <FaClipboard size={iconSize} />;
    } else if (taskNameLower.includes('shingle')) {
      return <GiStoneCrafting size={iconSize} />;
    } 
    
    // Contract and document tasks
    else if (taskNameLower.includes('contract') || taskNameLower.includes('agreement')) {
      return <FaFileContract size={iconSize} />;
    } else if (taskNameLower.includes('invoice') || taskNameLower.includes('payment')) {
      return <FaFileInvoiceDollar size={iconSize} />;
    } else if (taskNameLower.includes('estimate') || taskNameLower.includes('quote')) {
      return <FaCalculator size={iconSize} />;
    } else if (taskNameLower.includes('approval') || taskNameLower.includes('sign')) {
      return <FaFileSignature size={iconSize} />;
    } else if (taskNameLower.includes('permit') || taskNameLower.includes('license')) {
      return <FaShieldAlt size={iconSize} />;
    }
    
    // People and communication tasks
    else if (taskNameLower.includes('client') || taskNameLower.includes('customer')) {
      return <MdOutlinePermContactCalendar size={iconSize} />;
    } else if (taskNameLower.includes('consult') || taskNameLower.includes('meet')) {
      return <FaHandshake size={iconSize} />;
    } 
    
    // Construction tasks
    else if (taskNameLower.includes('construct') || taskNameLower.includes('build')) {
      return <FaHardHat size={iconSize} />;
    } else if (taskNameLower.includes('measure') || taskNameLower.includes('dimension')) {
      return <FaRuler size={iconSize} />;
    } else if (taskNameLower.includes('photo') || taskNameLower.includes('picture')) {
      return <FaCamera size={iconSize} />;
    } else if (taskNameLower.includes('site') || taskNameLower.includes('location')) {
      return <FaMapMarkedAlt size={iconSize} />;
    } else if (taskNameLower.includes('install') || taskNameLower.includes('setup')) {
      return <GiHammerNails size={iconSize} />;
    } else if (taskNameLower.includes('repair') || taskNameLower.includes('fix')) {
      return <FaWrench size={iconSize} />;
    } else if (taskNameLower.includes('paint') || taskNameLower.includes('finish')) {
      return <FaPaintRoller size={iconSize} />;
    } else if (taskNameLower.includes('electric') || taskNameLower.includes('wiring')) {
      return <BsFillLightningFill size={iconSize} />;
    } 
    
    // Status tasks
    else if (taskNameLower.includes('complete') || taskNameLower.includes('done')) {
      return <FaClipboardCheck size={iconSize} />;
    } else if (taskNameLower.includes('schedule') || taskNameLower.includes('appoint')) {
      return <FaCalendarCheck size={iconSize} />;
    } else if (taskNameLower.includes('inspect') || taskNameLower.includes('review')) {
      return <FaClipboard size={iconSize} />;
    } else if (taskNameLower.includes('deliver') || taskNameLower.includes('transport')) {
      return <FaTruck size={iconSize} />;
    } else if (taskNameLower.includes('assign') || taskNameLower.includes('task')) {
      return <MdOutlineAssignment size={iconSize} />;
    } else if (taskNameLower.includes('form') || taskNameLower.includes('document')) {
      return <BsPencilSquare size={iconSize} />;
    } 
    
    // Default icons
    else if (taskNameLower.includes('house') || taskNameLower.includes('home')) {
      return <FaHome size={iconSize} />;
    } else if (taskNameLower.includes('worker') || taskNameLower.includes('crew')) {
      return <FaHardHat size={iconSize} />;
    } else {
      return <FaFileAlt size={iconSize} />;
    }
  };

  return (
    <div className={styles.progressBarContainer}>
      <button 
        onClick={toggleOpen}
        className={styles.progressBarToggle}
      >
        <span>Progress Bar (Tasks)</span>
        <span>{isOpen ? '▲' : '▼'}</span>
      </button>
      
      {isOpen && (
        <div className={styles.progressBarPanel}>
          <table className={styles.progressBarTable}>
            <tbody>
              <tr>
                {tasks.map((task) => (
                  <td key={task.id}>
                    <div 
                      className={`
                        ${styles.taskIcon} 
                        ${styles.tooltip}
                        ${activeTaskId === task.id ? styles.taskIconActive : ''}
                      `}
                      data-tooltip={task.name}
                      onClick={() => handleTaskClick(task.id)}
                      style={{
                        borderColor: activeTaskId === task.id ? getIconColor(task.id) : undefined
                      }}
                    >
                      {getTaskIcon(task.name, task.completed)}
                    </div>
                    
                    {activeTaskId === task.id && (
                      <div 
                        className={`
                          ${styles.statusIndicator} 
                          ${styles.statusIndicatorVisible} 
                          ${getTaskStatus(task).status === 'completed' ? styles.statusCompleted : 
                            getTaskStatus(task).status === 'ongoing' ? styles.statusOngoing : 
                            styles.statusRemaining}
                        `}
                      >
                        {getTaskStatus(task).message}
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
          
          <div className={styles.editButtonContainer}>
            <button 
              className={styles.editButton}
              onClick={handleEditClick}
              disabled={!activeTaskId}
            >
              <FaEdit /> Edit Status
            </button>
            
            {showStatusDropdown && activeTaskId && (
              <div className={styles.statusDropdown}>
                <div 
                  className={`${styles.statusOption} ${styles.statusOptionCompleted}`}
                  onClick={() => updateTaskStatus('completed')}
                >
                  <FaCheck /> Completed
                </div>
                <div 
                  className={`${styles.statusOption} ${styles.statusOptionOngoing}`}
                  onClick={() => updateTaskStatus('ongoing')}
                >
                  <FaHourglass /> In Progress
                </div>
                <div 
                  className={`${styles.statusOption} ${styles.statusOptionRemaining}`}
                  onClick={() => updateTaskStatus('remaining')}
                >
                  <FaRegClock /> Not Started
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;