import TrainerRepository from "../../repositories/user/trainerRepository.js";
import catchAsync from "../../utils/catchAsync.js";


const trainerController = {}


// create a trainer
trainerController.createTrainer = catchAsync(async(req, res, next) => {
    const data = req.body

    const trainer = await TrainerRepository.create(data)
    
    if (!trainer) {
        return next(new AppError("Trainer creation failed", 500));
    }

    res.status(200).json({
        status: 'success',
        message: 'trainer created successfully'
    });
})

// fetch all trainers
trainerController.fetchAllTrainers = catchAsync(async (req, res, next) => {
  
  const trainers = await TrainerRepository.findAllTrainers();

  res.status(200).json({
    status: 'success',
    results: trainers.length,
    data: {
      trainers,
    },
  });
});



export default trainerController