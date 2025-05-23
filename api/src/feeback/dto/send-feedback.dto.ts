import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { FEEDBACK_TYPE } from '../consts';

export class SendFeedbackDto {
  @ApiProperty({
    description: 'The name of the user sending the feedback',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The email of the user sending the feedback',
    type: String,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'The feedback message',
    required: true,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  feedback: string;

  @ApiProperty({
    description: 'The type of feedback',
    required: true,
    enum: FEEDBACK_TYPE,
    type: String,
  })
  @IsEnum(FEEDBACK_TYPE)
  @IsNotEmpty()
  type: FEEDBACK_TYPE;
}
