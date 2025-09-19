import { Modal, Button, Form as AntdForm, Input, InputNumber } from 'antd';
import { Form, Field } from 'react-final-form';
import { Lesson } from '@/@types/ead';

interface LessonFormModalProps {
  open: boolean;
  onCancel: () => void;
  onFinish: (values: any) => void;
  initialValues: Lesson | null;
}

const LessonFormModal = ({ open, onCancel, onFinish, initialValues }: LessonFormModalProps) => {
  return (
    <Modal
      title={initialValues ? 'Edit Lesson' : 'New Lesson'}
      open={open}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
    >
      <Form
        onSubmit={onFinish}
        initialValues={initialValues || {}}
        render={({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <Field name="title" validate={value => (value ? undefined : 'Title is required')}>
              {({ input, meta }) => (
                <AntdForm.Item
                  label="Lesson Title"
                  required
                  validateStatus={meta.touched && meta.error ? 'error' : ''}
                  help={meta.touched && meta.error}
                >
                  <Input {...input} />
                </AntdForm.Item>
              )}
            </Field>
            <Field name="url">
              {({ input }) => (
                <AntdForm.Item label="Video URL">
                  <Input {...input} placeholder="https://youtube.com/watch?v=..." />
                </AntdForm.Item>
              )}
            </Field>
            <Field name="duration">
              {({ input }) => (
                <AntdForm.Item label="Duration (seconds)">
                  <InputNumber {...input} style={{ width: '100%' }} min={0} />
                </AntdForm.Item>
              )}
            </Field>
            <div style={{ textAlign: 'right' }}>
              <Button onClick={onCancel} style={{ marginRight: 8 }}>Cancel</Button>
              <Button type="primary" htmlType="submit">Save</Button>
            </div>
          </form>
        )}
      />
    </Modal>
  );
};

export default LessonFormModal;
